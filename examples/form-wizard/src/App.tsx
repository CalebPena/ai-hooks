import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AiGroup, AiProvider, useAiAction } from "@browser-agent/ai-hooks";

type FormState = {
  name: string;
  email: string;
  plan: "starter" | "pro" | "enterprise";
  teamSize: number;
  billingCycle: "monthly" | "annual";
  onboarding: boolean;
  notes: string;
};

const steps = ["Contact", "Plan", "Preferences", "Review"] as const;

export function App() {
  return (
    <AiProvider
      config={{
        name: "Signup Wizard",
        description: "A four-step signup form wizard for testing AI Hooks.",
      }}
    >
      <Wizard />
      <BridgeTester />
    </AiProvider>
  );
}

function Wizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    plan: "starter",
    teamSize: 3,
    billingCycle: "monthly",
    onboarding: true,
    notes: "",
  });

  useAiAction(
    useMemo(
      () => ({
        name: "Go to next wizard step",
        description: "Moves the signup wizard forward by one step.",
        schema: z.tuple([]),
        run: () => setStep((current) => Math.min(current + 1, steps.length - 1)),
      }),
      [],
    ),
  );

  useAiAction(
    useMemo(
      () => ({
        name: "Go to previous wizard step",
        description: "Moves the signup wizard backward by one step.",
        schema: z.tuple([]),
        run: () => setStep((current) => Math.max(current - 1, 0)),
      }),
      [],
    ),
  );

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AI Hooks Example</p>
        <h1>Signup Form Wizard</h1>
        <p>
          Use the buttons normally, or use the bridge tester below to simulate what a Chrome
          extension would send with <code>window.postMessage</code>.
        </p>
      </section>

      <section className="card">
        <ol className="steps">
          {steps.map((label, index) => (
            <li className={index === step ? "active" : ""} key={label}>
              {label}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <AiGroup
            config={{
              name: "Contact Step",
              description: "Readable content and actions for the contact step.",
            }}
          >
            <ContactStep form={form} setForm={setForm} setStep={setStep} />
          </AiGroup>
        ) : null}
        {step === 1 ? (
          <AiGroup
            config={{
              name: "Plan Step",
              description: "Readable content and actions for the plan step.",
            }}
          >
            <PlanStep form={form} setForm={setForm} setStep={setStep} />
          </AiGroup>
        ) : null}
        {step === 2 ? (
          <AiGroup
            config={{
              name: "Preferences Step",
              description: "Readable content and actions for the preferences step.",
            }}
          >
            <PreferencesStep form={form} setForm={setForm} setStep={setStep} />
          </AiGroup>
        ) : null}
        {step === 3 ? (
          <AiGroup
            config={{
              name: "Review Step",
              description: "Readable content and actions for the review step.",
            }}
          >
            <ReviewStep form={form} setForm={setForm} />
          </AiGroup>
        ) : null}

        <div className="actions">
          <button disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
            Back
          </button>
          <button disabled={step === steps.length - 1} onClick={() => setStep((current) => current + 1)}>
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

function ContactStep({
  form,
  setForm,
  setStep,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  useAiAction(
    useMemo(
      () => ({
        name: "Fill contact info",
        description: "Sets the user's name and email address on the contact step.",
        schema: z.tuple([z.string(), z.string().email()]),
        run: (name, email) => {
          setForm((current) => ({ ...current, name: String(name), email: String(email) }));
          setStep(1);
        },
      }),
      [setForm, setStep],
    ),
  );

  return (
    <div className="fields">
      <label>
        Name
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Ada Lovelace"
        />
      </label>
      <label>
        Email
        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="ada@example.com"
        />
      </label>
    </div>
  );
}

function PlanStep({
  form,
  setForm,
  setStep,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  useAiAction(
    useMemo(
      () => ({
        name: "Choose plan",
        description: "Chooses a subscription plan and team size.",
        schema: z.tuple([z.enum(["starter", "pro", "enterprise"]), z.number().int().min(1)]),
        run: (plan, teamSize) => {
          setForm((current) => ({
            ...current,
            plan: plan as FormState["plan"],
            teamSize: Number(teamSize),
          }));
          setStep(2);
        },
      }),
      [setForm, setStep],
    ),
  );

  return (
    <div className="fields">
      <label>
        Plan
        <select
          value={form.plan}
          onChange={(event) =>
            setForm((current) => ({ ...current, plan: event.target.value as FormState["plan"] }))
          }
        >
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </label>
      <label>
        Team size
        <input
          min={1}
          type="number"
          value={form.teamSize}
          onChange={(event) =>
            setForm((current) => ({ ...current, teamSize: Number(event.target.value) }))
          }
        />
      </label>
    </div>
  );
}

function PreferencesStep({
  form,
  setForm,
  setStep,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  useAiAction(
    useMemo(
      () => ({
        name: "Set signup preferences",
        description: "Sets billing cycle and whether guided onboarding is requested.",
        schema: z.tuple([z.enum(["monthly", "annual"]), z.boolean()]),
        run: (billingCycle, onboarding) => {
          setForm((current) => ({
            ...current,
            billingCycle: billingCycle as FormState["billingCycle"],
            onboarding: Boolean(onboarding),
          }));
          setStep(3);
        },
      }),
      [setForm, setStep],
    ),
  );

  return (
    <div className="fields">
      <label>
        Billing cycle
        <select
          value={form.billingCycle}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              billingCycle: event.target.value as FormState["billingCycle"],
            }))
          }
        >
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </label>
      <label className="checkbox-label">
        <input
          checked={form.onboarding}
          onChange={(event) => setForm((current) => ({ ...current, onboarding: event.target.checked }))}
          type="checkbox"
        />
        Include guided onboarding
      </label>
    </div>
  );
}

function ReviewStep({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  useAiAction(
    useMemo(
      () => ({
        name: "Add review notes",
        description: "Adds notes to the final review step.",
        schema: z.tuple([z.string()]),
        run: (notes) => setForm((current) => ({ ...current, notes: String(notes) })),
      }),
      [setForm],
    ),
  );

  return (
    <div className="review">
      <dl>
        <dt>Name</dt>
        <dd>{form.name || "Not provided"}</dd>
        <dt>Email</dt>
        <dd>{form.email || "Not provided"}</dd>
        <dt>Plan</dt>
        <dd>{form.plan}</dd>
        <dt>Team size</dt>
        <dd>{form.teamSize}</dd>
        <dt>Billing cycle</dt>
        <dd>{form.billingCycle}</dd>
        <dt>Guided onboarding</dt>
        <dd>{form.onboarding ? "Included" : "Not included"}</dd>
      </dl>
      <label>
        Notes
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Anything the agent should remember?"
        />
      </label>
    </div>
  );
}

function BridgeTester() {
  const [response, setResponse] = useState<unknown>(null);
  const [snapshotActionId, setSnapshotActionId] = useState("");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window || event.data?.source !== "ai-hooks-page") {
        return;
      }

      setResponse(event.data);
    }

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function send(type: string, extra: Record<string, unknown> = {}) {
    window.postMessage(
      {
        source: "ai-hooks-extension",
        requestId: crypto.randomUUID(),
        type,
        ...extra,
      },
      window.location.origin,
    );
  }

  return (
    <aside className="tester">
      <h2>Bridge Tester</h2>
      <div className="actions">
        <button onClick={() => send("ping")}>Ping</button>
        <button onClick={() => send("getSnapshot")}>Get Snapshot</button>
      </div>
      <label>
        Action id
        <input
          value={snapshotActionId}
          onChange={(event) => setSnapshotActionId(event.target.value)}
          placeholder="Paste an id from the snapshot"
        />
      </label>
      <button
        onClick={() =>
          send("invokeAction", {
            id: snapshotActionId,
            parameters: [],
          })
        }
      >
        Invoke With No Args
      </button>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </aside>
  );
}
