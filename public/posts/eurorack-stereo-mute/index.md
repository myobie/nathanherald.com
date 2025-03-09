+++
title = "Creating an immediate stereo mute in Eurorack 🤔"
date = "2023-11-13T13:40:55+01:00"
+++

I’m just starting to learn about [Eurorack][] and [modular synthesizers][], so I think I’m definitely missing quite a bit here, but I couldn’t find an existing module or an online post for how to push a button to mute two voltages at once…

[Eurorack]: https://en.wikipedia.org/wiki/Eurorack
[modular synthesizers]: https://en.wikipedia.org/wiki/Modular_synthesizer

So, and I suppose this is a normal feeling when working with modular, **I had to invent my own mute.** 

I’m learning about Eurorack using [VCV Rack][], the incredible program which emulates voltage controlled modules in a very nice, visual rack. Here is the patch I was working on yesterday (a “patch” just means “I wired things up this way”):

{{<fig
  src="patch@2x.png"
  alt="Screenshot of the entire patch in VCV Rack" />}}
  
[VCV Rack]: https://vcvrack.com/

I’ve patched [Plaits][] into [Beads][], and I wanted to be able to quickly mute the stereo output of Beads with a single click.

[Plaits]: https://www.modulargrid.net/e/mutable-instruments-plaits
[Beads]: https://www.modulargrid.net/e/mutable-instruments-beads

There is a built-in Mutes module, but it only lets me mute one thing at a time. I want to mute both the left and right output from Beads at exactly the same time with one click. So it’s a no-go.

{{<fig
  src="mutes@2x.png"
  alt="Screenshot of the Mutes module in VCV Rack" />}}

In the short time I’ve been learning about modular I’ve learned that anytime I want to control the volume of something I want to reach for a VCA (voltage controlled amplifier). So I pulled two VCAs out into the rack and just starred for a bit…

{{<fig
  src="two-vcas@2x.png"
  alt="Screenshot of two VCAs turned down to 0% wired up to a scope module" />}}

I browsed through all the modules I have in my library in VCV Rack and saw a “Push” module, which is just a push button to go from 0V to 10V when pushed, and then back to 0V when 
released. **That is close!**

{{<raw>}}
<figure>
<img
  src="push-button@2x.mov"
  width="331"
  alt="Screen recording of pushing the Push button which opens the VCAs while held down">
</figure>
{{</raw>}}

What I want is a toggle tho, I don’t want to have to hold the button down. I want to toggle between 0V and 10V.

Well, after just clicking around for quite a while, I accidentally learned that the “Hold” button in the Push module will “push and hold” the button, so it’s effectively a toggle for on vs. off. 🙌 So I already had all the modules I needed in place.

{{<raw>}}
<figure>
<img
  src="hold-button@2x.mov"
  width="331"
  alt="Screen recording of pushing the Hold button which toggles the VCAs on and off">
</figure>
{{</raw>}}

It was super fun to have to look at the tools available and reason out how to accomplish my goal. I may have chosen a long or difficult path, but I ended up where I wanted to be 💪 

I bet this is why a lot of people get into and enjoy modular and Eurorack… solving problems and puzzles which result in sounds and music is super addictive.