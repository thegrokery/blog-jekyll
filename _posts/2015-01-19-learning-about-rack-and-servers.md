---
layout: post
date:   2015-01-19
category: tech
title: Learning about Rack and servers in general
tags: rack
---

**tl;dr - webservers (generally) send HTML responses to browsers, but the HTML doesn't have to be in a file, we could build it dynamically for each request. The HTTP path is just a hint.**

## Introduction

This weekend my sweetie asked me some questions about Jekyll that, while perfectly reasonable for where she's at, indicated to me that she had hit the wall of a threshold problem that I've observed before in students. Namely, the problem of what a server **actually** is and how they work.

I've struggled with this problem for a long time, it's very hard for me to figure out how to teach because I'm not sure how I learned about it. I think the same problem resurfaces about 4 times:

1. "Wait, when I connect to localhost it's talking to my laptop?" (Using localhost)
2. "Wait, when I connect to localhost it doesn't look up a .html file on my harddrive?" (Routing and paths)
3. "Wait, when I connect to localhost and submit a form the server doesn't implicitly know what to do?" (HTTP verbs)
4. "Wait, when I connect to localhost it doesn't even have to serve up HTML?" (Content types)
5. "Wait, who are you and why are you in my closet?"

Really, it's the last one at the root of things, but it takes a while to get there. We all have to learn a lot to get there. There are more but they come more easily later on.

So anyways, my sweetie hit number 2 this weekend over breakfast and didn't understand quite why I was so excited to walk through this with her; she has a way of clarifying my thoughts and helping me build curriculum. So we arranged a trade, she would teach me to crochet and I would teach her about netcat (which, once you know both you'll realize that crocheting has more applications in life and is infinitely more valuable. Take that!)

## The code

https://github.com/thegrokery/rack-howto

I've attempted to consolidate the code into a repo to explore point 2 of the threshold concept. Learning about netcat (aka `nc` on the command-line) will allow you to explore generic Layer 4 TCP servers (Yes, I realize that sounds like mumbo jumbo).

The README.md has instructions that I thought might be enough to get you through the activity. You should play liberally, this is weird material so it's important that you engage with it and try to break it.

**It is expected that you've played with the code before you continue reading. You may get something from the article to follow, but you'll get a lot more if you play with the code first.**

## What is a TCP server?

<figure>
  <a href="http://compnetworking.about.com/od/basicnetworkingconcepts/l/blbasics_osimod.htm"><img src="/images/posts/basics_osimodel.jpg" alt="The OSI model of networking" title="The OSI model of networking" /></a>
  <figcaption><a href="http://compnetworking.about.com/od/basicnetworkingconcepts/l/blbasics_osimod.htm">Original article here</a></figcaption>
</figure>

Let's start with "protocol". A protocol is an agreed upon convention about how we communicate. Part of most protocols is how we will greet each other. For humans, the agreed upon protocol in some areas is to wave and say, "Hello"; but for other humans the protocol is to kiss each other on the cheek. Either way, it shows that we're at least friends enough to bother pretending that we like each other for the duration of the conversation.

TCP is a protocol that computers are much happier with. It has greeting ceremonies (3-way handshake) as well as agreements about how messages will be reconstructed when they've traveled all the way across the world to your browser. At the end of the day, when you open up netcat, what I hope you'll realize is that the TCP protocol is _just_ a way of getting text from one machine to another.

When we boot up netcat and listen for our browser, what you'll see is something like this:

```
GET /?person=Erica&q=test HTTP/1.1
Host: localhost:9393
Connection: keep-alive
Cache-Control: max-age=0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.85 Safari/537.36
DNT: 1
Accept-Encoding: gzip, deflate, sdch
Accept-Language: en-US,en;q=0.8
```

The above is not TCP, it is HTTP. TCP was responsible for getting this text from my browser, to the netcat server; but HTTP is the protocol that actually understands what to do with it. Netcat is entirely unaware of what it transfers, so we have to fill in the details for it and type something in response to the browser.

## What is an HTTP server then?

So, netcat is interesting, but many people feel a little let down when I show them netcat output and proudly proclaim that it's a server. Maybe it's my hair, or maybe I'm just too jubilant about it. Or maybe it's just that netcat has done such a good job of managing the network interface that it's rendered the entire exercise boring.

Since netcat and related tools are so capable of handling the network side, the only thing left to do is to handle the HTTP part and send back some HTML that can be displayed in the browser. Let's look at the individual parts of the HTTP request.

```
GET /?person=Erica&q=test HTTP/1.1
```

This is the most important part of the HTTP request. It is structured like this: `<VERB> <path> <protocol>`. The verb is a hint about what type of activity we would like to do. The path is a hint about where or maybe what to do. And the protocol is just some bookkeeping saying, "yes, in fact we are talking HTTP as opposed to say, email or instant messenger protocol".

The verb is usually GET (retrieve info) or POST (create, update, delete info) but some servers are starting to use more than just these two verbs (mostly because POST is overloaded with responsibilities). You may see these verbs in action:

* GET: Retrieve data
* POST: Create data
* PUT or PATCH: Update data
* DELETE: Delete some data
* HEAD or INFO or OPTIONS: I don't really know what these do. Probably safe to ignore them for now.

## You're being very vague about the path

Yes. This is the crux of the problem I think.

In the beginning we created files on our system called `something.html` and when we did a GET request `GET /something.html HTTP/1.1` it looked on the filesystem, read that .html file, and returned it over the network. Life was good and easy. Looking on the filesystem for a file was something we could do very easily and quickly, but as the Internet started evolving people became less interested in fixed information, they wanted to post their views, comment, upload pictures, and search the internet for pictures of cats.

It's hard to blame them, but it poses a problem for us. Here our HTTP protocol only specifies a "verb" and a "path", that's not much to work with. So people started wondering, what if we just used the path as a hint about what we want to do? For instance, what if we tried this url? `www.google.com/search?q=kittens` (Go ahead, it totally works). Note there's not a .html anywhere in that address. And I can assure you that there's not a file sitting on a server at Google, Inc. that has the filename `search?q=kittens`, if for no reason other than that computers don't often like having '?' in filenames!

So how does google do it? How will we do it?

<figure>
  <img src="/images/posts/web-fs-backend.jpg" alt="Webserver checks the filesystem first, then sends along to backend server" title="Check the filesystem first" />
  <figcaption>Checking the filesystem first</figcaption>
</figure>

The essence is that we'll ask our webservers to be a little more clever. We'll ask them to listen like normal, and check the filesystem for .html files, but if it receives a request for a file that doesn't exist, check in with our friend Ruby or PHP or Python to see if they can do something to create HTML. Sending the request along is called reverse-proxying. Apache and Nginx are extremely common "fronting webservers".

We check the filesystem first just in case there is a static file that the fronting webserver can return immediately. Great examples of this are images, javascript, and CSS which change very rarely compared to how often the content needs to change.

**This is the most important point:** webservers (generally) send HTML responses to browsers, but the HTML doesn't have to be in a file, we could build it dynamically for each request. The HTTP path is just a hint, it could be a filename, but most likely it's a message we send to a "backend" processor to build a custom HTML response for our end-user.

This bears repeating: Webservers send HTML, but it doesn't have to be on a harddrive somewhere.

## So how do we make Ruby make HTML? Does it randomly pick tags?

I remember thinking exactly this. You may laugh, but it's true. We all start from the same place.

The way a backend webserver makes an HTML response is generally by taking some form of HTML template and filling in some blanks. It's quite a lot like [madlibs](http://en.wikipedia.org/wiki/Mad_Libs) if you played that as a kid. The act of filling in the blanks is called _interpolation_.

So what we do is we rip apart the path, combine it with some info maybe from our database, and build an HTML response by filling out the template. This is all well and good until it's not.

## Conclusion

Servers are hard. They really are, it's not just you. And if you aren't struggling with them, your neighbor is.

<figure>
  <img src="/images/posts/web-to-fs-no.jpg" alt="How webservers actually work - skipping the filesystem" title="How webservers actually work" />
  <figcaption>How webservers actually work - skip the filesystem</figcaption>
</figure>

The most common problem area I've seen is that we learn HTML and CSS first by creating .html files. But when we get into Ruby land it just doesn't feel like the same thing. We assume that somewhere Ruby is creating an html file and returning it or something along those lines. This is a perfectly reasonable thought considering the path we all took to get here, but it's missing a step that greatly changes our perception of how servers actually work.

Dynamic backend servers do not need to create .html files, they can simply send the text directly to the browser. Even in the case where they **do** create files, this is generally done only for performance reasons so that the next time no backend server is even needed.


