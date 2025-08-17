---
title: "Huginn and Muninn"
date: 2025-07-17T10:54:18+03:00
featuredImage: ravens.jpg
categories:
- Kubernetes
- DevOps
- IT
- Automation
summary: "Book II of the Kubernetic Edda."
tags:
- Kubernetes
- DevOps
- IT
- Observability
- Norse Mythology
- ReadinessProbe
- LivenessProbe
draft: false
---

## The Gaze of the All-Observer

**Odin was the Control Plane.** In the celestial spires of coordination and will, he reigned as the All-Observer of the Cluster. Upon his shoulders perched two ravens—**Huginn** and **Muninn**—ancient agents of inquiry and revelation.

* **Huginn**, whose name meant *Thought*, flew out each dawn to glean the *present state* of the Nine Constructs *(whose mysteries are carved in the next saga)*. He saw running pods, measured CPU and memory, watched the flickering of containers—*liveliness* in motion. His flight echoed the command:

  ```bash
  kubectl get pods -n asgard -o wide
  ```

  This was the wingbeat of thought: *"Are they alive? Do they move and breathe?"*

* **Muninn**, meaning *Memory*, did not merely watch the now. He flew deep into the archives of the realm—past logs, events, and recorded failure. He asked:
  *"What has passed? What secrets do the scrolls of `describe` and logs whisper in the dark?"*

  ```bash
  kubectl describe pod pod-valkyrie-scout-8fd74f97f7-x6nq9 -n asgard
  kubectl logs pod pod-valkyrie-scout-8fd74f97f7-x6nq9 -n asgard
  ```

Thus, Odin saw the world through their returning insight. Huginn flew swift through metrics. Muninn sifted deep into event scrolls and postmortem runes.

## The Reflexes of the Constructs

The **Runekeeper**, keeper of manifests, gave the pods their own reflexes—biological instincts—so the birds might find signals worth heeding. These reflexes were etched within the scrolls of the pod’s specification.

Within a pod's full definition, under the container stanza, the Runekeeper wrote:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-valkyrie-scout
  namespace: asgard
spec:
  containers:
    - name: valkyrie-container
      featuredImage: valkyrie:v1
      ports:
        - containerPort: 8080
      livenessProbe:
        httpGet:
          path: /healthz       # The endpoint checked to see if the pod is alive
          port: 8080           # Port to hit on the container
        initialDelaySeconds: 3 # Seconds to wait before first check
        periodSeconds: 5       # Interval between checks
      readinessProbe:
        httpGet:
          path: /ready         # The endpoint checked to see if the pod is ready to serve
          port: 8080
        initialDelaySeconds: 2 # Seconds before first readiness check
        periodSeconds: 3       # Interval between readiness checks
```

These were *the heartbeat and consciousness* of the pod itself.

* The **livenessProbe** whispered whether the soul still stirred. If the `/healthz` path failed, the kubelet would slay and respawn the container.
* The **readinessProbe** declared whether the being was fit to stand in battle. A failing `/ready` would withhold traffic until the pod stood prepared.

## The Eye of the All-Father

Should the Runekeeper wish to narrow Odin’s gaze, he spoke incantations of focus:

```bash
kubectl config use-context dev-odin
kubectl config set-context --current --namespace=midgard
```

And thus did the ravens fly only over Midgard, that lesser realm of mortals and staging environments.

## Summary of the Raven-Eye

| Entity           | Mythic Symbol | K8s Reality                                                                                        |
| ---------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| Huginn (Thought) | Present sight | `kubectl get`, `kubectl top`, metrics-server                                                       |
| Muninn (Memory)  | Deep memory   | `kubectl describe`, logs, events                                                                   |
| Probes           | Reflexes      | `livenessProbe` / `readinessProbe`                                                                 |
| Odin             | Control Plane | Central brain of the Cluster; orchestrates and commands via API, scheduler, and controller-manager |

Thus was observability born—not of blind seeing—but of active **query, analysis, and memory**.

And their feathers inked the logs of the world.
