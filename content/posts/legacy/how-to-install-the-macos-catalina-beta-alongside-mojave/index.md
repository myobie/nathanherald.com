+++
title = "How to install the macOS Catalina Beta alongside Mojave"
date = "2019-06-17T11:21:13.316Z"
mediumUrl = "https://medium.com/@myobie/how-to-install-the-macos-catalina-beta-alongside-mojave-818a97d38c9"
aliases = [
  "/writing/legacy/how-to-install-the-macos-catalina-beta-alongside-mojave/"
]
+++

I’m sure you are interested in playing with [SwiftUI](https://developer.apple.com/documentation/swiftui) just like I am, but you are also hesitant to install the [latest macOS Beta](https://www.apple.com/macos/catalina-preview/) because it will surely mess up homebrew and generally cause inconvenience.  Even more, the live UI previews in XCode only work when running XCode inside the beta macOS…

**If you have a recent Mac with an APFS formatted drive then you can easily create a little area for the Beta without changing anything about your current setup.**

[APFS supports multiple “volumes” in the same “container.](https://www.macobserver.com/tips/deep-dive/apfs-faq-partitions-volumes-afps-containers/)” A new volume can be created super quick on the fly, can be flexible in it’s size (with min/max settings on the GB reserved/used), and a “container” (think drive) shares all it’s space with all it’s volumes so you don’t have to know ahead of time how much space each volume really needs.

_Below are the simple steps to create a volume, install macOS Mojave on it, then upgrade that volume’s OS to Catalina._

### 1. Create a volume

Search using Spotlight (⌘ space) for _Disk Utility_ and open it. Make sure your primary hard drive is selected in the left sidebar, then click the Plus icon in the toolbar to add a volume.

{{<fig src="1-XDH849DbmTwKvr5SON076A.png" alt="Screenshot of Disk Utility showing a sheet to Add APFS volume to container">}}
I named my new volume Beta
{{</fig>}}

You can choose to set _Size Options…_ to set a minimum reserve and a maximum usage for the volume. **You will need at least 30 GB of space** to get the macOS beta + XCode Beta installed with some wiggle room. I set my Beta volume to reserve at least 20GB and restrict to a maximum of 100GB.

### 2. Install macOS Mojave

**One cannot install macOS Catalina directly**: instead, one must upgrade from Mojave. Even if you are currently running macOS Mojave, you will need to download the macOS installer to use with the new volume.

Using Spotlight (⌘ space) again, search for _App Store_ and open it. Search the App Store for _macOS_ and find the page for Mojave.

{{<fig src="1-lbKgsosyxa7B6EmXbQdtqQ.png" alt="Screenshot of the macOS App Store app listing for macOS Mojave">}}
Use the App Store to “Get” macOS Mojave
{{</fig>}}

Click _Get_ and it will open the _Software Update_ preference pane in _System Preferences_. Let it download the huge installer and it will eventually present you with the below Installer window. This will take a while…

{{<fig src="1-Qbxuad8OQl6CjgB9YCnZaA.png" alt="Screenshot of the macOS installer with the ability to select the destination volume">}}
Choose the new volume
{{</fig>}}

Be sure to choose the new volume and proceed to install.   
This will take a while…

### 3. Install macOS Catalina

After installation is done and you’ve setup your new “computer” you will need to navigate to the [Apple Developer Downloads](https://developer.apple.com/download/) page to install the beta.

{{<fig src="1-UJ8lu3LY-vtBAL0mf6IEGQ.png" alt="Screenshot of Apple's Beta Software Downloads webpage">}}
Apple’s developer downloads page
{{</fig>}}

Choose _Install Profile_ which will open the _Software Update_ preference pane of _System Preferences_ again. This time, it will offer to download an installed for the macOS 10.15 Beta (which is Catalina).

Install (download) it and it will eventually present an installation window.

{{<fig src="1-5PSZ8X5F2F_KXuMe-MhGDw.png" alt="Screenshot of the macOS installer">}}
Install macOS Catalina just like Mojave before
{{</fig>}}

This will also take a while…

You can still access your other volume from inside the macOS Catalina beta, so there isn’t any reason to copy over all your files or anything. This is great if you have an XCode project you want to work on or test out from the beta, but don’t want to have to transfer files all the time.

**I recommend installing applications separately onto Catalina and not trying to run applications from the Applications directory of the other volume.**

Download the [XCode Beta](https://developer.apple.com/download/#app) and go create a new macOS or iOS project using SwiftUI. You choose to use SwiftUI either as a checkbox or dropdown in the _New Project sheet_.

{{<fig src="1-qT-FmZHbCJfnYXSD4ueEkw.png" alt="Screenshot of Xcode with a panel for creating a new project">}}
One can choose SwiftUI when creating a new project
{{</fig>}}

### 4. Learn about SwiftUI

I recommend going through the wonderful [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui/tutorials) published by Apple. They walk through a ton of good stuff and cover a lot more than the basics. I really enjoyed going through it.

{{<fig src="1-3b9HsS6TTn1kDt7AnGiOBA.png" alt="Screenshot of the Learn to Make Apps with SwiftUI webpage" />}}

### 5. Restart into Mojave

You can restart back and forth between the OS’s anytime using the _Startup Disk_ preference pane in _System Preferences_.

{{<fig src="1-BS9gN8E59TmcumZPRxxlrg.png" alt="Screenshot of the Startup Disk preference pane">}}
You will need to “unlock” the Startup Disk preference pane by clicking the lock in the bottom left corner
{{</fig>}}

_You can also keep_ **_⌥ option_** _pressed when the computer is booting which will tell the computer to enumerate the bootable volumes and let you click which one to boot into._

### That’s it

Good luck. Comment if I got anything wrong. And have fun with SwiftUI, [Combine](https://developer.apple.com/documentation/combine), and the new live UI previews in XCode. 🤖