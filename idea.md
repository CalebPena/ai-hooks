I want to build a React library that can be used to expose actions to a crome extension,
that will then be exposed to an ai agent.

I am thinking of doing something liek this:

I would have a wrapper component that would manage the state of the available actions, and expose them to the chrome extension.
```js
<AiActionWrapper>
    <App />
</AiActionWrapper>
```

I would then be able to register hooks for actions.
```js
const useAction = useAiAction(() => {/* go to next step*/}, config)
```

We would also have a way for the AI to read certain parts of the page. By using innerHTML or innerText, and maybe be able to get a screenshot of that section.
```js
<AiSection config={config}>
    <div>Hello world</div>
</AiSection>
```

We would also need to expose a way for the AI to navigate links,
so we could do something like this (although we would need to make this compatable with other libraries like tanstack router):
```js
<AiLink config={config} href="https://google.com">
    Go to google
</AiLink>
```

I am thinking that the config would look something like this:
```js
config = {
    name: "Go to Next Step",
    description: "Continue to the next step in the application",
    group: formActions,
}

formActions = {
    name: "Form Actions",
    description: "A description of the form so that we don't need to repeat context for every action in a form so taht we can save context.",
}
```

All of this would get exposed to the chrome extension,
and the chrome extension would then expose this to the AI (I am thinking that the AI would have a skill to be able to use this).
