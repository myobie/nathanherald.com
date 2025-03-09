+++
title = "Why passkeys are good and you should be advocating for their use"
date = "2024-11-04T15:41:58+01:00"
+++

1. Passkeys are a great “remember me on this device” that always works, doesn’t rely on cookies
2. If you are in an ecosystem, they will sync to all your devices
3. In the near future, passkeys will even sync across ecosystems

> TL;DR: We all know physical security keys are incredibly secure. Passkeys are modeled on physical security keys and are both incredibly secure and incredibly easy to use to sign in after they are setup. You get issued one just like a physical security key: **you prove who you are, then you get a secure key that re-proves and re-authorizes you with just a fingerprint or face scan ** or whatever. Finally the “remember me on this device” checkbox will actually work.

**Passkeys are the ultimate “remember me on this device.”** 

How many times have you checked that box and it didn’t work? You cookies are lost or something, who knows. Passkeys don’t rely on cookies, are incredibly secure, so finally “remember me” will actually work.

### Why tho?

**Making people provide a password over and over is incredibly insecure!** We know this, **we have the data,** people will make mistakes. Yes, you. You will, statistically, eventually make a mistake with a password. 

**And passkeys making re-signing in easier + prevent us from doing anything by accident.**

You should not be entering in your password over and over, the “remember me” should actually work. It’s way more secure for remember me to work than to ask someone to constantly provide a password – no possible attempts to phish that password.

### What passkeys are not

You get a passkey **after** you prove who you are. You still need a way to initially prove who you are.

Passkeys are modeled on physical yubikey-like devices. So imagine getting a passkey in the mail or being handed one in person.

In the past, I would prove who I am to a company and they would issue me a physical yubikey. They’d write down the serial number of that yubikey and note that I have it. Any device with that yubikey plugged in can be assumed that it is definitely me, I don’t have to provide a password, email, or anything. The key both reminds the service who I am and proves that I am definitely who I was when I was given the key.

And, just like a physical yubikey, if I were to lose it, then I’d have to re-prove who I was to get a new one.

### Passkeys are the same as physical keys

You initially do the more difficult proving step, usually clicking a link in an email or something like that. And that step hopefully has a two factor component, to make sure you really are who you say you are. **You want this step to be difficult,** because you shouldn’t be doing it very often.

**After** you have proven who you are, then you can get a very secure key that will on it’s own **re-prove** and **re-identify** you over and over again with just a finger print, face scan, or something similar. 

Imagine it. *Finally the “remember me on this device” checkbox will actually work.*

### Are Passkeys ready today?

Passkeys are good today, because:

1. **Passwords are 100% known to be problematic,** we have the data. You may think you are not going to fall for a phishing attempt, but anyone can and does. Don’t be so arrogant to imagine that you can’t. And phishing isn’t the only problem, it’s a huge deal and no one is immune.
2. Even if you had to do the more difficult proving step for each of your devices, it’s only one time per device. After that, use biometrics or similar and you are in. No cookies, no password to remember or lose, you are good now forever on this device. This **is unquestionably easier** for normal and power users. **“Remember me on this device” finally works.**
3. Good ecosystems already sync passkeys: apple, google, 1password, etc. If you use them, then you only have to sign in the more difficult way one time, period. **Then you are good on all your devices in that ecosystem.** If you use two ecosystems, then you’ll have to do the difficult sign in two times (one per ecosystem), which is fine. (And, they are working on cross-ecosystem passkey sharing, so you only have to do the difficult prove who you are step once across all types of devices!)

*We all know physical security keys are incredibly secure.* **Passkeys are modeled on physical security keys** and are both **incredibly secure** and **incredibly easy** to use after they are setup. 

You get issued one just like a physical security key: you prove who you are, then you get a secure key that re-proves and re-authorizes you with just a fingerprint or face scan or whatever. Any device with that key can be 100% trusted.

Sure, you still have to prove who you are one time in a more difficult way. It’s one time. And I would suggest that it be made even more difficult to prove who you are, since you won’t have to do it very often anymore. It should be pretty difficult to get a new passkey.

And you don’t have to worry about losing a passkey: you can just do the more difficult “prove who you are” step again and make a new one, just like requesting a new hardware key. There will always continue to be “account recovery” steps. 

**Passkeys really are just an incredibly secure and easy “remember me on this device” that works.** 

### Some FAQs

* *Are passkeys useful as a second factor:* I would say no. They are meant to be used as the ultimate “remember me on this device” and that isn’t what we think of as a second factor.
* *What if someone gains access to my email, can’t they just get a passkey issued to them?* 
    * If the service requires both an email link click + a second factor (like a one time passcode), then no. The attacker won’t have the one time passcode (the second factor).
    * If a service really only checks email and then issues a passkey, then yes that’s bad. That service would let anyone pretend to be you if they have access to your inbox today. So the service is very insecure and it’s unrelated to passkeys.
* *Can I still have a password?*
    * Yes, a password could be part of the “prove who you are in a more difficult way” flow. However, passwords are known to be terrible, people do make mistakes and enter them into the wrong places, and so it is a risk to allow someone to get a passkey after entering a password. The service really should implement a second factor. A password + second factor as the “difficult path to get a passkey” is perfectly fine, and that lets the passkey focus on being the ultimate “remember me on this device.” **So take how you sign in today + actually remember me on this device that works.**

