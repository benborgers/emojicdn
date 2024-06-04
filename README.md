# emojicdn

## Basic usage

Append any emoji to the end of `emojicdn.elk.sh` to get a PNG image:

```html
<img src="https://emojicdn.elk.sh/🥳" />
```

## Emoji style

For more control, add the `style` query parameter to specify an emoji platform:

```html
<img src="https://emojicdn.elk.sh/🥳?style=google" />
```

If no `style` is provided, the API defaults to `apple`.

Supported styles:

- `apple`
- `google`
- `facebook`
- `twitter`

## Implementation

- `emoji.json` from: https://github.com/iamcal/emoji-data/blob/master/emoji.json

## Hosting

emojicdn is hosted on [Hetzner](https://hetzner.com) with [Kamal](https://kamal-deploy.org). To deploy a new version, run `kamal deploy`.
