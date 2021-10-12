# panoptyk-engine

Massive Multiplayer Online Role Playing Game (MMORPG) engine built around information flow.

## Architecture 

<img src=https://github.com/panoptyk/panoptyk-engine/blob/dev/docs/images/ArchitectureDiagram.png width=650 >

## Setting up your local dev environment
Upon cloning this repository, there are a few steps you need to take to begin developing locally. You must be on a unix shell for everything to work. 

Run the following commands from the main repo directory: 
```
npm install
npx lerna bootstrap
npm run test
```

```npm install``` to install node dependencies

Because project is a mono-repo containing three seperate npm packages, ```lerna``` is used to assist in package management & deployment. ```npx lerna bootstrap``` sets up the inter-dependency hooks between the three packages.

Finally, run ```npm run test``` to confirm you are able to compile and run the project code. (Unit tests should all be passing)
