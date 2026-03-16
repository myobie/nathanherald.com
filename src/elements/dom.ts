import { parseHTML } from 'npm:linkedom'

const doc = parseHTML('<!doctype html><div></div>')

export const { customElements, Event, HTMLElement } = doc
