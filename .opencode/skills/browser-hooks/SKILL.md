---
name: browser-hooks
description: Use when interacting with a browser tab that may have the ai-hooks React library installed; provides Browser Agent WebSocket requests for listing browser-hook tabs, reading snapshots, and invoking actions.
---

# Browser Hooks

Use this skill when the browser context includes a `tabId`, or when the user asks you to interact with a website that may use the `ai-hooks` React library.

The Browser Agent server exposes browser hooks through its local WebSocket API at:

```text
ws://127.0.0.1:3877
```

The page must have the `ai-hooks` library mounted, and the Browser Agent Chrome extension must be connected.

## Workflow

1. If browser context includes `tabId`, start with `aiHooks.snapshot` for that tab.
2. If no `tabId` is available, use `aiHooks.tabs.list` to find tabs with ai-hooks installed.
3. Inspect the snapshot. Use `name`, `description`, `schema`, and `isReadable` to decide what to do.
4. Use `aiHooks.invoke` to run an action by id.

## Requests

List tabs with ai-hooks installed:

```json
{ "type": "aiHooks.tabs.list", "requestId": "req-1" }
```

Get the action/readable tree for a tab:

```json
{ "type": "aiHooks.snapshot", "requestId": "req-2", "tabId": 123 }
```

Invoke an action:

```json
{
  "type": "aiHooks.invoke",
  "requestId": "req-3",
  "tabId": 123,
  "id": "action-id-from-snapshot",
  "parameters": []
}
```

Responses use the Browser Agent response envelope:

```json
{ "type": "response", "requestId": "req-1", "ok": true, "data": {} }
```

## Shell Helper

Use this pattern from bash to send a single request:

```bash
node - <<'NODE'
const request = { type: 'aiHooks.tabs.list', requestId: crypto.randomUUID() }
const ws = new WebSocket('ws://127.0.0.1:3877')
ws.addEventListener('open', () => ws.send(JSON.stringify(request)))
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.type === 'response' && message.requestId === request.requestId) {
    console.log(JSON.stringify(message, null, 2))
    ws.close()
  }
})
ws.addEventListener('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
NODE
```

For a known `tabId`, request a snapshot:

```bash
node - <<'NODE'
const tabId = 123
const request = { type: 'aiHooks.snapshot', requestId: crypto.randomUUID(), tabId }
const ws = new WebSocket('ws://127.0.0.1:3877')
ws.addEventListener('open', () => ws.send(JSON.stringify(request)))
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.type === 'response' && message.requestId === request.requestId) {
    console.log(JSON.stringify(message, null, 2))
    ws.close()
  }
})
NODE
```

## Notes

- `isReadable: true` means invoking that node reads visible page content rather than performing an app action.
- `schema` is a JSON string describing the argument array expected by `parameters`.
- Always pass `parameters` as an array because ai-hooks validates it with a tuple/array Zod schema.
- Prefer semantic ai-hooks actions over brittle DOM selectors when available.
