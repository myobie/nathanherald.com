+++
title = "How I restored and setup my new (to me) $10 iPod shuffle (2nd Gen) with my M1 Mac running Sonoma"
date = "2024-04-30T00:21:41+02:00"
+++

I’ve had a hankering for an iPod for a while, so I decided to take the plunge and get a shuffle to try it out. My phone is too important now! And I don’t really want to drain the battery all the time when I’m out and about… I already have a camera, now a music player, if I buy a physical map then I’ll have my own App Store in my backpack 🤦

Getting the iPod shuffle setup wasn’t straightforward… so here is how I got it all working.

I bought mine on [Kleinanzeigen](https://www.kleinanzeigen.de) for 10 bucks. The person was very prompt. They let me use the in-app purchase system – which I prefer and recommend, don’t “send PayPal friends and family” to people. Not too scary, it all Just Worked™

## 1) Restore…

Restoring on macOS isn’t as easy anymore. The parts of iTunes that used to sync with iPods is now in the Finder! And my Finder crashed when I tried to restore the iPod. When I tried again, it hung forever and never finished. _(If your Finder allows you to restore the iPod then you can skip right to step 2!)_

What I learned is: **iTunes still works and you can still download iTunes on Windows** 💪

Running Windows is actually pretty easy these days with [UTM](https://mac.getutm.app). I had remembered companies like Parallels and VM Ware, but those cannot emulate x86 Windows on my M1 (ARM) Mac and we need the x86 version of iTunes… so UTM is it.

### UTM is a whole deal

While UTM is free and it works well, it is not easy to figure out how to get it all working correctly.

And sadly, the best info I found is all glommed up in this YouTube video: [How to install Windows 10 on M1 Mac – Full Tutorial using UTM app](https://www.youtube.com/watch?v=KsNoGPczavw). Now *I am very grateful that this video exists,* but I prefer to not need to pause, back up, go forward, etc for an hour…

Here are the important steps in text:

1. Install [UTM](https://mac.getutm.app)
2. Download a Windows 10 ISO from here: <https://www.microsoft.com/en-us/software-download/windows10ISO> (an ISO is a virtual CD, so this is basically the install CD)
3. Download the drivers you need from here: <https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio/virtio-win-0.1.190-1/> (these are the Fedora drivers and they will help UTM know how to get Windows 10 working well, these are also on a virtual CD)
    * Do not get the latest version of these drivers, only use this specific 190 version linked above. It’s tempting to use a version in the 200s, it feels like we should use the newest ones, but don’t do it. Use this 190 version.
4. Download the “Guest Tools” from here: <https://github.com/utmapp/qemu/releases/download/v7.0.0-utm/spice-guest-tools-0.164.4.iso> (you can read more about the “Guest Tools” here <https://docs.getutm.app/guest-support/windows/>, they just make UTM work better with macOS…)
5. Download and open a UTM VM template: <https://web.archive.org/web/20230218145944/https://chrisp.cafe/UTM/Windows_10_x64.utm.zip> (this is an archived copy of a template which used to be on chrisp.cafe’s website 🤷)
    * Move the template to where you want to keep your virtual Windows 10 machine. Don’t keep it in Downloads or put it in your iCloud Drive or anything like that. Your Windows VM will eventually be multiple GB in size and I ended up with many GBs of stuff in my Downloads folder, which I didn’t want.
    * Double click the template file to open UTM and you’ll see it in the UTM sidebar and a play button to start it up. **Click play to run it.**
    * Using this UTM template is important because it’s already setup to prevent you from having weird network issues during the Windows install.
6. Use the CD icon in the toolbar to change to the windows 10 ISO as the disk
7. Reboot, and make sure to hit space so it boots from a CD or DVD
    * If you pay attention when the computer is booting up, you’ll see it says “press any key to boot from CD or DVD” and that’s why we hit a key – we want to boot from our Windows 10 ISO
    * This will boot into the Windows installer 🙌 we are getting there
8. Choose your language and tell it you don’t have a product key
    * You won’t have to pay for Windows. You can use Windows for a short time without entering a product key and we will be done before that time is over. And we can always start over with a fresh VM in UTM if it starts to complain.
9. Choose Windows 10 Pro. Choose Custom Install (advanced).
10. When you get to the “choose a disk” screen, there won’t be any disks visible. We need to install the drivers so Windows can see them.
    1. Use the CD icon to change to the virtio ISO file, the drivers virtual disk we downloaded. We are going to load 3 drivers.
    2. Click “Load driver”
    3. Navigate into the CD’s directories with “Browse”
    4. `smbus > 2k8 > amd64`, “Next”
    5. “Load driver” again, “Browse”
    6. `qxldod > w10 > amd64`, “Next”
    7. “Load driver” one last time, “Browse”
    8. `viostor > w10 > amd64`, “Next”
	9. Now the Drive shows up and can be chosen to install Windows onto it, but you can’t proceed with “Next” yet…
	10. Use the CD icon to change back to the Windows 10 ISO
	11. Click “Refresh”
	12. Now you can click “Next”, and now it will take a very long time… until it asks you to provide a username
11. Provide a username, leave the password blank, “Next”, and it boots into Windows 🎉
12. Use the CD icon to change to the Guest Tools ISO
	1. Open the CD in the Explorer
	2. Run the spice guest tools application on the CD
	3. Eject the CD once it’s done
13. Shutdown Windows
	* If the screen is black for a long time, the VM doesn’t know that windows has quit so you can just power it off yourself (it’s like having a real, old computer…)
14. Click the icon to edit the VM’s options
15. Add a Network where the Disk stuff is
	* Make sure it’s a `virtio-net-pci` one
16. Change the Display graphics to `virtio-gpu-cpi`
	* Don’t choose Retina, it will be sloooooow
17. Now download and install an old iTunes version that still works
	* Download and install iTunes from this page: <https://support.apple.com/en-us/106372>
	* Don’t download iTunes from the Microsoft Store it can’t deal with iPods
	* You’ll need to restart Windows after installing it
18. Plug in your iPod and UTM will try to grab the USB device from macOS, you’ll need to say “OK” or “Allow” twice for it to work. The iPod will now show up in Windows.
19. iTunes should now be able to restore it just fine, it might be slow though
20. Choose to use it as a disk in iTunes and apply that change

Now you can put music on there from your Mac, but only if UTM is not running, so shutdown Windows and completely quit UTM.

## 2) Adding Music…

I don’t want to deal with iTunes on Windows or Mac day-to-day… and it turns out one can just use the Finder to put music files on the iPod, run a python script in the Terminal and it will jam all those files into the iPod’s internal database.

The python script is from: <https://github.com/myobie/shuffle-db>

**First,** you’ll need to install python and then install one package:

```sh
# if you don't have brew installed, then that is a whole deal and you can read more over at https://brew.sh

brew install python
pip3 install --break-system-packages eyed3
```

Then we can download the python script directly from the code repository.

```
cd ~/Downloads && curl -O "https://raw.githubusercontent.com/myobie/shuffle-db/master/src/python/rebuild_db3.py"
```

In the Finder, drag the `rebuild_db3.py` file from your Downloads folder to the iPod’s drive that is mounted there. It needs to be at the root.

Now, **second,** make a folder on the iPod’s drive named “Music” – put your mp3’s and m4a’s in there. You can even do nested folders. The iPod will play things in file order by default, so you can name stuff to get them into the order you want like `01`, `02`, …

After you have them all in there, **third,** you can run this so the iPod will recognize and play those files:

```sh
# Make sure to replace iPod with the name of your iPod. If you don't know the name of your iPod, then you can type "cd " and then drag the iPod's drive from the Finder into the Terminal window and it will insert the path to it.

cd /Volumes/iPod/
python3 rebuild_db3.py Music/
```

So you’re telling python “rebuild the database using this Music folder.”

> Or, if you’re like me and you will definitely forget all that, you can download my `rebuild.command` file and just double click that to run the rebuild script.
>
>     cd ~/Downloads && curl -O "https://gist.githubusercontent.com/myobie/5c0c25cc867420ba15885e53a9a3e133/raw/ac91f695f02c5c2b0b1e8a0c5a6398830eeddd08/rebuild.command"
>     cd ~/Downloads && chmod +x rebuild.command
>
> Drag the `rebuild.command` file onto the iPod’s drive, and now you can double click that to run the python script for you. You can look here and see that `rebuild.command` file is just that one line that starts with `python`: <https://gist.github.com/myobie/5c0c25cc867420ba15885e53a9a3e133>

Tada 🎉

Now you have working iPod shuffle that can clip on your shirt and provide you music and happiness for 4–8 hours \(ᵔᵕᵔ)/

_(If I get time, I’ll try to update this with screenshots… we’ll see…)_
