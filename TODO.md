# TODOs

- [x] `rm public/links`
- [x] `rm public/keybase.txt` I don’t need that anymore
- [x] Implement redirect from `/writing/*` to `/posts/*` and `rm public/writing`
- [ ] Remove hash from css and js, etags should be good enough (find and replace)
- [ ] Copy all the original markdown files into the folders to sit next to the `index.html`s and then `rm ./content`
- [ ] Is there an automated way to soft wrap the text in long paragraphs in every page?
- [ ] Why is it `/posts/rss.xml` and not just `/rss.xml`? Move it?
- [ ] What are the steps to adding a new post?
    - [ ] Write in markdown
    - [ ] Convert to html
    - [ ] make `:slug/index.html` + any asssets in `public/posts`
        - [ ] Automate making a slug? Maybe a shortcut?
    - [ ] Add link to `public/posts/index.html`
    - [ ] Add link to `public/index.html`
    - [ ] Add to `public/rss.xml` – can this be automated, at least the generation of the escaped content? Maybe a Shortcut?
- [ ] How we going to handle the fonts? GitHub Action?
- [ ] Where will this live long term? CF Worker?
- [ ] SSD?
