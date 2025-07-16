---
title:  The Mirror Ascends
date: 2025-07-16T12:54:22+02:00
tags:
draft: true
categories:
image: kube.png
description: "Book I of The Kubernetic Edda, A Saga of YAML, Blood, and Eventual Consistency"
---

In times of old, where **Ymir** (the tangled, pre-containerized infrastructure) dwelt, nor sand nor sea, nor nodes nor pods existed. Not declarative state nor resilience. Only EC2 instances, crontabs, manual failovers, and nginx configs like spiderwebs.

’Twas chaos—a chasm of impermanence and toil.

Then came the sons of Borr:

* **Odin**, the **Control Plane**, whose will defined the desired state and kept all in sync. Like the all-seeing one, he orchestrated the domain through abstraction and decree.
* **Vili**, the **Scheduler**, whose name means *will*—he placed pods upon nodes as one might cast runes, balancing fate and load.
* **Vé**, the **API Server**, the sacred interface through which all definitions were spoken and all intentions registered. He was the mouthpiece of the system and the entry point to its divine workings.

These three beheld the bloated body of Ymir, whose legacy code threatened all creation. They struck him down with blade and YAML. From his flesh they formed the **nodes**; from his bones, the **availability zones**—isolated regions of infrastructure designed to contain failure and shield the realm from cascading doom; from his blood, the **VPCs and networks**—virtual private clouds that defined the borders and passageways of communication, separating realms while allowing chosen flows; and from his skull, they stretched the **Ingress Controller** across the firmament.

Thus did the Control Plane inscribe the laws of state into the fabric of the cluster: observed and desired, continuously reconciled.

From the ashes of old, a solitary enchantress emerged: **Freyja’s Mirror**, a fragile **Pod** known as `holy-api`, whispering answers through RESTful incantations. She stood alone in a Namespace called **Vanaheimr**, noble but imperiled—spawned from imperative rituals, bound to no Deployment, anchored to a single node.

But the Norns, those who weave the fates of uptime and fault-tolerance, frowned. “This one shall fall, and no replica shall take her place. The world remembers not the ephemeral.”

So the **Runekeeper** was summoned.

> “Take this Mirror,” said the Oracle, “and cast her anew in triplicate. Let her essence be woven into a **Deployment**, guarded by a ReplicaSet, self-healing and eternal. And let her bear the Seal of Containment:
>
> `allowPrivilegeEscalation: false`
>
> `privileged: false`
>
> For no container should rise with unbounded might, lest it defile the node entire.”

## The Ritual

1. First, he whispered to the cluster, summoning a base scroll from command:

   ```bash
   kubectl create deployment holy-api \
     --image=<original-image> \
     --replicas=3 \
     --dry-run=client -o yaml > /opt/course/9/holy-api-deployment.yaml
   ```

2. Then, he unsealed the scroll and carved the Oaths of Containment into the container spec:

   ```yaml
   securityContext:
     allowPrivilegeEscalation: false
     privileged: false
   ```

3. With the configuration complete, he invoked the word of power:

   ```bash
   kubectl apply -f /opt/course/9/holy-api-deployment.yaml
   ```

4. And as the three replicas took form—interchangeable and fault-tolerant—the lone Pod, unguarded by any controller, was cast into the Void:

   ```bash
   kubectl delete pod holy-api
   ```

Thus did `holy-api` ascend from impermanence to immortality.

And in `/opt/course/9/holy-api-deployment.yaml`, the new order was etched. The Control Plane nodded. Etcd remembered.
