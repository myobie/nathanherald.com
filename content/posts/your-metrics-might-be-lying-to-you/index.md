+++
title = "Your metrics might be lying to you – an example from Wunderlist"
date = "2020-06-10T14:48:33+02:00"
aliases = [
  "/writing/your-metrics-might-be-lying-to-you/"
]
+++

We all love to see “increased engagement” from customers using the products we create, but it’s not always as clear as it might seem if the increase is positive or negative. It’s sometimes dangerous to have the singular goal to “increase usage of this feature” instead of “help customers get more done.” And even then, when our goal is 100% focused on helping the customer be a better human, we can sometimes misread the metrics we are collecting.

{{<raw>}}
<figure>
<img src="bell.svg" width="600" height="150">
</figure>
{{</raw>}}

At Wunderlist, the *notifications about recent activity* feature was akin to the limit theorem: we iterated and iterated, but it always seemed like we couldn’t get to our ideal place to help customers see and understand what’s been happening in their lists. I believe we did our best, but there is one time where we thought we had improved things and it ended up we had done the opposite.

We instrumented the apps to let us know when someone clicked on the *notification bell* and we saw that hardly anyone was clicking on it. So we went to work: how could we help people know there is useful information in the *notifications popover*. 

{{<raw>}}
<figure>
<img src="bell-with-dot.svg" width="600" height="150">
</figure>
{{</raw>}}

We added a red dot to indicate “hey, there’s some new stuff here.” Clicking to show the *notification popover* would remove the red dot *(until later when there is new activity)*. 

And our metrics for clicks on the *notification bell* went way up! **Success.**

Luckily, we dug a bit deeper into the stats and we noticed a strange occurrence: often there were two clicks from the same device in rapid succession, both clicks in less than two seconds. We assumed we had made a mistake in our apps and they were reporting the click twice. But we couldn’t reproduce this ourselves and it wasn’t reported twice every time, just often.

{{<raw>}}
<figure>
<svg width="600" height="150" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="150" fill="none"/>
<rect width="600" height="150" rx="8" fill="#9EC2E2"/>
<rect y="51" width="600" height="47" fill="white"/>
<path d="M307.08 75.396C306.436 74.64 306.044 73.688 305.96 72.68L305.792 70.916C305.596 68.312 303.664 66.156 301.2 65.568V65.4C301.2 64.616 300.584 64 299.8 64C299.016 64 298.4 64.616 298.4 65.4V65.568C295.936 66.156 294.004 68.312 293.808 70.916L293.64 72.68C293.556 73.688 293.192 74.64 292.52 75.424L291.456 76.684C290.532 77.832 290 79.26 290 80.716V81.5C290 81.892 290.308 82.2 290.7 82.2H308.9C309.292 82.2 309.6 81.892 309.6 81.5V80.716C309.6 79.26 309.068 77.832 308.144 76.684L307.08 75.396ZM308.2 80.8H291.4V80.716C291.4 79.596 291.792 78.476 292.548 77.58L293.612 76.32C294.452 75.312 294.928 74.08 295.04 72.792L295.18 71.028C295.376 68.676 297.42 66.8 299.8 66.8C302.18 66.8 304.224 68.676 304.42 71.028L304.56 72.792C304.672 74.08 305.176 75.312 305.988 76.32L307.052 77.58C307.808 78.476 308.2 79.596 308.2 80.716V80.8ZM303.02 83.74C302.712 83.516 302.264 83.572 302.012 83.88C300.948 85.308 298.652 85.308 297.56 83.88C297.336 83.572 296.888 83.516 296.58 83.74C296.272 83.964 296.216 84.412 296.468 84.72C297.252 85.784 298.484 86.4 299.8 86.4C301.116 86.4 302.348 85.784 303.132 84.72C303.384 84.412 303.328 83.964 303.02 83.74Z" fill="black"/>
<circle id="dot" cx="306" cy="72" r="3.75" fill="#DD2339" stroke="white" stroke-width="1.5" opacity="0"/>
<path id="flyout" fill-rule="evenodd" clip-rule="evenodd" d="M300 97L306.235 106H409.2C413.68 106 415.921 106 417.632 106.872C419.137 107.639 420.361 108.863 421.128 110.368C422 112.079 422 114.32 422 118.8V151H317V148C317 146.895 316.105 146 315 146H188C186.895 146 186 146.895 186 148V151H177V118.8C177 114.32 177 112.079 177.872 110.368C178.639 108.863 179.863 107.639 181.368 106.872C183.079 106 185.32 106 189.8 106H293.765L300 97ZM188 121C186.895 121 186 121.895 186 123V128C186 129.105 186.895 130 188 130H333C334.105 130 335 129.105 335 128V123C335 121.895 334.105 121 333 121H188ZM187 133C186.448 133 186 133.448 186 134V138C186 138.552 186.448 139 187 139H365C365.552 139 366 138.552 366 138V134C366 133.448 365.552 133 365 133H187Z" fill="white" opacity="0"/>
<g id="cursor" transform="translate(100,100)">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M303 75V91.015L306.225 87.8836L308.48 93.2243L312.085 91.6893L309.984 86.619H314.591L303 75Z" fill="white"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M304 88.5951V77.4071L312.165 85.5901H308.471L310.751 91.0086L308.907 91.7826L306.537 86.1458L304 88.5951Z" fill="black"/>
</g>
<animate xlink:href="#dot" attributeName="opacity" from="0" to="1" dur="0.1s" begin="1s; cursor-move-out.end + 5s" fill="freeze" id="dot-appear"/>
<animate xlink:href="#cursor" attributeName="transform" from="translate(100,100)" to="translate(0,0)" dur="0.25s" begin="dot-appear.end + 0.2s" fill="freeze" id="cursor-move-in"/>
<animate xlink:href="#flyout" attributeName="opacity" from="0" to="0" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.9; 1" dur="0.4s" begin="cursor-move-in.end + 0.2s" fill="freeze" id="flyout-toggle"/>
<animate xlink:href="#dot" attributeName="opacity" from="1" to="0" dur="0.1s" begin="flyout-toggle.begin + 0.15s" fill="freeze" id="dot-disappear"/>
<animate xlink:href="#cursor" attributeName="transform" from="translate(0,0)" to="translate(100,100)" dur="0.25s" begin="flyout-toggle.end + 0.2s" fill="freeze" id="cursor-move-out"/>
</svg>
</figure>
{{</raw>}}

We realized our customers were clicking once to show the popover, then immediately again to hide it.

It turned out customers really just wanted to remove the red dot. **Our metrics were lying:** positive engagement with notifications wasn’t going up as we had thought. Instead, we were annoying people.

Like I typed above: we never got the notifications feature to the point we wanted and that’s OK. Some features are infinite projects, require continual investment and adjustments, and are made incrementally better over time.
