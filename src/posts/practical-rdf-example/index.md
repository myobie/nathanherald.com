---
title: Practical example of how cool RDF is
date: 2026-05-15T15:14:00+02:00
description: A small maritime walkthrough of how an agent can answer real questions when every fact, action, and result is a claim.
---

Imagine we’ve ingested a ton of maritime data. (I couldn’t come up with a better example today.)

Someone asks us “Can shipment 8821 go through the Suez Canal?”

Before: someone has to query different systems for regulations, jurisdictions, routes, cargo manifests, and permits. JOIN them if possible. Paste them into an LLM to synthesize, and hope the answer is complete.

What we _could_ do: we can ingest all our data into a semantic knowledge system and let an agent query through at the semantic level.

Our agent might get a list of tools it can call:

<details>
<summary>Lots of JSON</summary>

```
{
  "actions": [
    {
      "name": "CanTransitAction",
      "description": "Determine whether a shipment may transit a jurisdiction under active maritime policy.",
      "input": {
        "type": "object",
        "required": ["shipment", "jurisdiction", "validTime"],
        "properties": {
          "shipment": {
            "type": "string",
            "description": "IRI of the shipment entity.",
            "examples": ["cargo:shipment-8821"]
          },
          "jurisdiction": {
            "type": "string",
            "description": "IRI of the jurisdiction entity.",
            "examples": ["jurisdiction:egypt-suez"]
          },
          "validTime": {
            "type": "string",
            "format": "date-time",
            "description": "The real-world time for which the transit decision should be evaluated."
          }
        },
        "additionalProperties": false
      },
      "output": {
        "type": "object",
        "required": ["type", "allowed", "reason", "citesClaim", "usedPolicy"],
        "properties": {
          "type": {
            "const": "CanTransitResult"
          },
          "allowed": {
            "type": "boolean"
          },
          "reason": {
            "type": "string"
          },
          "citesClaim": {
            "type": "array",
            "items": { "type": "string" }
          },
          "usedPolicy": {
            "type": "string"
          }
        },
        "additionalProperties": false
      }
    },
    {
      "name": "ResolveEntityAction",
      "description": "Resolve a human phrase like 'shipment 8821' or 'Suez Canal' into a substrate IRI.",
      "input": {
        "type": "object",
        "required": ["mention", "expectedType"],
        "properties": {
          "mention": {
            "type": "string",
            "description": "The phrase supplied by the user.",
            "examples": ["shipment 8821", "Suez Canal"]
          },
          "expectedType": {
            "type": "string",
            "description": "The expected entity type.",
            "enum": ["Shipment", "Jurisdiction", "Port", "Vessel", "Permit", "CargoType"]
          }
        },
        "additionalProperties": false
      },
      "output": {
        "type": "object",
        "required": ["status"],
        "properties": {
          "status": {
            "type": "string",
            "enum": ["resolved", "ambiguous", "not_found"]
          },
          "iri": {
            "type": "string",
            "description": "Resolved entity IRI when status is resolved."
          },
          "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "matchedBy": {
            "type": "array",
            "items": { "type": "string" },
            "examples": [["exact shipmentId"], ["label", "alias"]]
          },
          "citedClaims": {
            "type": "array",
            "items": { "type": "string" }
          },
          "candidates": {
            "type": "array",
            "description": "Candidate entities when status is ambiguous.",
            "items": {
              "type": "object",
              "required": ["iri", "label", "confidence"],
              "properties": {
                "iri": { "type": "string" },
                "label": { "type": "string" },
                "confidence": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 1
                }
              },
              "additionalProperties": false
            }
          }
        },
        "additionalProperties": false
      }
    }
  ]
}
```
</details>

The `CanTransitAction` looks correct, but the agent needs to first resolve the entities from plain text to IDs first:

```elixir
action(%{
  action: "ResolveEntityAction",
  expectedType: "Shipment",
  mention: "shipment 8821"
})
```

```elixir
action(%{
  action: "ResolveEntityAction",
  expectedType: "Jurisdiction",
  mention: "Suez Canal"
})
```

Then it can try to run the action:

```elixir
action(%{
  "action": "CanTransitAction",
  "shipment": "cargo:shipment-8821",
  "jurisdiction": "jurisdiction:egypt-suez",
  "validTime": "2026-05-12T00:00:00Z"
})
```

Pretty straightforward and it _should_ get back an answer. 

**But what is actually in our “database” though?** 

The *claims* we have might look like:

```trig
# @prefix declarations left out on purpose

GRAPH :CargoTransitPolicy-v12 {
  :CargoTransitPolicy-v12 a :TransitPolicy ;
    :blocksCargoType :SanctionedGoods ;
    :requiresPermit [
      :forCargoType :HazardousCargo ;
      :throughJurisdiction :EgyptSuez ;
      :permitType :SuezHazmatPermit ;
    ] .
}

GRAPH cargo:claim-100 {
  cargo:shipment-8821 a onto:Shipment ;
    onto:contains cargo:diesel-fuel ;
    onto:origin port:singapore ;
    onto:destination port:rotterdam .
}

GRAPH cargo:claim-101 {
  cargo:diesel-fuel a onto:HazardousCargo ;
    onto:hazardClass "flammable-liquid" .
}

GRAPH route:claim-200 {
  route:singapore-to-rotterdam onto:transitsThrough jurisdiction:egypt-suez .
}

GRAPH reg:claim-300 {
  jurisdiction:egypt-suez onto:allowsTransitOf onto:HazardousCargo ;
    onto:requiresPermit permit:suez-hazmat-permit .
}

GRAPH permit:claim-400 {
  cargo:shipment-8821 onto:hasPermit permit:suez-hazmat-permit-778 .
}
```

We would likely persist “quads” which is a “triple” + named graph. ([RDF Quads](https://sphn-semantic-framework.readthedocs.io/en/latest/background_information/nquads.html) has a nice graphic that kinda helps illustrate this.)

A [triple](https://en.wikipedia.org/wiki/Semantic_triple) is the smallest assertion in our system. A triple is always subject, predicate, and object. `Nathan → hasEmail → <myobie@duck.com>`.

That last quad in the above `.trig` document says: “shipment 8821 has permit 778.” By itself, it does not say what the permit allows. The meaning comes from combining it with the other claims: Suez requires a hazmat permit for hazardous cargo, the shipment contains hazardous cargo, and the shipment has the required permit. Being able to combine these claims lets us build up a world of facts which we can then answer questions from.

A quad is the smallest stored assertion: subject, predicate, object, and named graph. In this type of system, a "claim" is typically a named graph / claim packet containing one or more quads plus metadata such as provenance, policy, validation, and signatures. The subjects and objects are nodes. The predicates are the edges.

`GRAPH` names a collection of triples inside an RDF dataset. The graph name itself is an IRI, so the system can make statements about the graph elsewhere. A line ending in a `;` means the next line still applies to the same subject. A line ending in `.` means that’s it for this subject. 

Actions are also claims in the _database_:

```trig
GRAPH :CanTransitAction {
  :CanTransitAction a :ExecutableAction ;
  :inputShape :CanTransitActionShape ;
  :outputShape :CanTransitResultShape ;
  :runtime "elixir" ;
  :mfa "Maritime.Actions.CanTransit.run/2" ;
  :requiredCapability :CanEvaluateTransitPolicy ;
  :usesPolicy :CargoTransitPolicy-v12 .
}

GRAPH :ResolveEntityAction {
  :ResolveEntityAction a :ExecutableAction ;
    :inputShape :ResolveEntityInputShape ;
    :outputShape :ResolveEntityResultShape ;
    :runtime "elixir" ;
    :mfa "Substrate.Actions.ResolveEntity.run/2" ;
    :requiredCapability :CanResolveEntities .
}
```

And here is some elixir pseudo-code that the persisted MFA might point to:

<details>
<summary>`Maritime.Actions.CanTransit`</summary>

```elixir
defmodule Maritime.Actions.CanTransit do
  @moduledoc """
  Evaluates whether a shipment may transit a jurisdiction.

  Input shape:  :CanTransitActionShape
  Output shape: :CanTransitResultShape
  Policy:       :CargoTransitPolicy-v12
  """

  def run(input, ctx) do
    projection =
      ctx.open_projection!(
        ontology: "maritime-compliance-v4",
        valid_time: input.validTime,
        capability_envelope: ctx.capabilities
      )

    shipment = projection.entity!(input.shipment)
    jurisdiction = projection.entity!(input.jurisdiction)

    cargo_types = projection.types_for_contained_cargo(shipment)
    permits = projection.permits_for(shipment)

    required_permit =
      projection.required_permit_for(
        cargo_types: cargo_types,
        jurisdiction: jurisdiction,
        policy: ":CargoTransitPolicy-v12"
      )

    cond do
      required_permit && required_permit not in permits ->
        %{
          type: ":CanTransitResult",
          allowed: false,
          reason: "Shipment requires #{required_permit} for transit through #{input.jurisdiction}.",
          citesClaim: [
            "cargo:claim-100",
            "cargo:claim-101",
            "route:claim-200",
            "reg:claim-300"
          ],
          usedPolicy: ":CargoTransitPolicy-v12"
        }

      true ->
        %{
          type: ":CanTransitResult",
          allowed: true,
          reason: "Shipment may transit because all required permits are present.",
          citesClaim: [
            "cargo:claim-100",
            "cargo:claim-101",
            "route:claim-200",
            "reg:claim-300",
            "permit:claim-400"
          ],
          usedPolicy: ":CargoTransitPolicy-v12"
        }
    end
  end
end
```
</details>

The result of the action can itself become a claim:

```trig
GRAPH :result-900 {
  :result-900 a :CanTransitResult ;
    :allowed true ;
    :reason "Shipment 8821 may transit because hazardous cargo is allowed with the required Suez hazmat permit." ;
    :citesClaim cargo:claim-100 ;
    :citesClaim cargo:claim-101 ;
    :citesClaim route:claim-200 ;
    :citesClaim reg:claim-300 ;
    :citesClaim permit:claim-400 ;
    :usedPolicy :CargoTransitPolicy-v12 .
}
```

So it’s claims all the way down.

By making everything in the system a claim we build up a world that is coherent and governed. Claims can describe policies and capabilities, and claims can also be governed by policies and capabilities. Which means every actor can only move through the substrate with their given capabilities: human or agent.

And to take it a bit further: an agent can “tend the garden of shapes” to help keep things tidy and coherent. If the system were built correctly, everything an agent does would be reviewable and reversible. Then all queries can operate at a well curated semantic layer and return real, trustable results.

This maritime example might seem far from your use cases, but this is applicable even for very personal data. Scanning PDFs and emails of all your medical records to build up the facts of your medical history, household knowledge base, job search / placement projects, etc. Pretty cool.
