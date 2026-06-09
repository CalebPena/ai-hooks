# ai-hooks

React primitives for exposing app-native actions and readable page context to browser agents.

## Install

```sh
npm install @browser-agent/ai-hooks
```

## Usage

```tsx
import { AiProvider, AiGroup, useAiAction } from "@browser-agent/ai-hooks";
import { z } from "zod";

function App() {
  return (
    <AiProvider
      config={{
        name: "Signup Wizard",
        description: "A form wizard exposed to browser agents.",
      }}
    >
      <SignupForm />
    </AiProvider>
  );
}

function SignupForm() {
  return (
    <AiGroup
      config={{
        name: "Contact Step",
        description: "Visible contact form content.",
      }}
    >
      <ContactStep />
    </AiGroup>
  );
}

function ContactStep() {
  useAiAction({
    name: "Fill contact info",
    description: "Sets the user's name and email address.",
    schema: z.tuple([z.string(), z.string().email()]),
    run: (name, email) => {
      // Update app state here.
    },
  });

  return <form>{/* ... */}</form>;
}
```

## Browser Bridge

`AiProvider` installs a page bridge that listens for `window.postMessage` requests from a browser extension content script.

Supported request types:

- `ping`
- `getSnapshot`
- `invokeAction`

Responses are posted back with source `ai-hooks-page`.

## Provider Options

Disable all ai-hooks behavior while leaving the app unchanged:

```tsx
<AiProvider disabled config={config}>
  <App />
</AiProvider>
```

When disabled, the provider returns only `children` and does not create the bridge or register groups/actions.

## Examples

Run the local form wizard example:

```sh
cd examples/form-wizard
npm install
npm run dev
```
