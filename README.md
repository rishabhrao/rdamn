# rdamn - Online Playground IDEs

[![rdamn.cloud](https://img.shields.io/website?logo=R&down_color=red&logoColor=white&down_message=down&label=rdamn.cloud&style=for-the-badge&up_color=green&up_message=up&url=https%3A%2F%2Frdamn.cloud)](https://rdamn.cloud)
[![Vercel Deployment](https://img.shields.io/github/deployments/rishabhrao/rdamn/production?label=Vercel%20Development&logo=vercel&logoColor=white&style=for-the-badge)](https://github.com/rishabhrao/rdamn/deployments/activity_log?environment=Production)

[![rdamn-server Checks](https://img.shields.io/github/workflow/status/rishabhrao/rdamn-server/Check?label=rdamn-server%20Checks&logo=amazon&logoColor=white&style=for-the-badge)](https://github.com/rishabhrao/rdamn-server/actions/workflows/check.yml)
[![rdamn-playground Checks](https://img.shields.io/github/workflow/status/rishabhrao/rdamn-playground/Check?label=rdamn-playground%20Checks&logo=amazon&logoColor=white&style=for-the-badge)](https://github.com/rishabhrao/rdamn-playground/actions/workflows/check.yml)

[![Build Documentation](https://img.shields.io/github/workflow/status/rishabhrao/rdamn/Deploy%20Documentation/main?label=Build%20Documentation&logo=github-actions&logoColor=white&style=for-the-badge)](https://github.com/rishabhrao/rdamn/actions/workflows/deployDocs.yml)
[![Deploy Documentation](https://img.shields.io/github/deployments/rishabhrao/rdamn/github-pages?label=Deploy%20Documentation&logo=github&logoColor=white&style=for-the-badge)](https://github.com/rishabhrao/rdamn/deployments/activity_log?environment=github-pages)

---

## Table of Contents

- [rdamn - Online Playground IDEs](#rdamn---online-playground-ides)
  - [Table of Contents](#table-of-contents)
  - [How Playgrounds Work](#how-playgrounds-work)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
  - [Documentation](#documentation)

---

## How Playgrounds Work

![rdamn Architecture](https://raw.githubusercontent.com/rishabhrao/rdamn/main/public/architecture.svg)

---

## Tech Stack

- [Next.js](https://nextjs.org) is used as the full stack [React](https://reactjs.org) framework.
  - The website is hosted on [Vercel](https://vercel.com).
  - The Codebase is written completely in [Typescript](https://www.typescriptlang.org) running in `strict` mode. The use of `any` is disallowed by tsconfig.
  - [Monaco Editor](https://microsoft.github.io/monaco-editor) is used as the Code Editor for the Playgrounds.
  - [Xterm.js](https://xtermjs.org) is used as a terminal to connect to [node-pty](https://www.npmjs.com/package/node-pty) running on the Playgrounds.
  - [Ajv](https://ajv.js.org) is used to validate and parse all requests.
  - [Auth0](https://auth0.com) is used for Authentication.
  - [SWR](https://swr.vercel.app) is used for client-side data caching.
  - [Tailwind CSS](https://tailwindcss.com) is used for styling.
  - [DaisyUI](https://daisyui.com) is used as the primary Component UI library.
  - [Prettier](https://prettier.io) Code Formatter is used to enfore consistent code styling.
- [MongoDB](https://www.mongodb.com) is used as the primary NoSQL Database.
  - [MongoDB Atlas](https://www.mongodb.com/atlas) instance is used as the primary NoSQL DB.
  - [Mongoose](https://mongoosejs.com) is used to model objects and make queries to MongoDB.
- [Redis](https://redis.io) is used for caching and storing ephemeral data. [ioredis](https://www.npmjs.com/package/ioredis) is used as the Redis client to make queries.
  - [Redis Enterprise Cloud (Non Persistant)](https://redis.com/redis-enterprise-cloud) is used as the primary Redis instance.
  - [ioredis](https://www.npmjs.com/package/ioredis) is used as the Redis Client.
- [Amazon EC2](https://aws.amazon.com/ec2) is used for the [DNS](https://www.npmjs.com/package/denamed) and SSL [Reverse Proxy](https://www.npmjs.com/package/http-reverse-proxy-ts) Server for Playgrounds.
- [Amazon ECS](https://aws.amazon.com/ec2) is used for running Playgrounds in [Docker](https://www.docker.com) Containers on ephemeral [AWS Fargate](https://aws.amazon.com/fargate) instances.
- [Amazon S3](https://aws.amazon.com/s3) is used for storing Playground Files and Data across Sessions.
- [Cloudflare](https://www.cloudflare.com) is used to handle DNS Records for the Main Website and for DDOS Prevention.
- [Let's Encrypt](https://letsencrypt.org) is used for generating SSL Certificates for the Servers.
- [Sematext](https://sematext.com) is used for Error logging.
- [Checkly](https://www.checklyhq.com/) is used for Uptime Checks.

---

## Project Structure

The Project is divided into three main repositories:

- [rdamn](https://github.com/rishabhrao/rdamn): The Frontend code running Next.js and deployed on Vercel ([rdamn.cloud](https://rdamn.cloud)).

- [rdamn-server](https://github.com/rishabhrao/rdamn-server): The DNS ([play.rdamn.cloud](http://play.rdamn.cloud)) and SSL Reverse Proxy Server ([proxy.rdamn.cloud](https://proxy.rdamn.cloud)) for connecting to Playgrounds deployed on Amazon EC2.

- [rdamn-playground](https://github.com/rishabhrao/rdamn-playground): The Docker container for Playground that runs on AWS Fargate with Amazon ECS.

There are also a few additional repositories for Playground Starter Templates. These are in the format `rdamn-template-*`. Current Templates:

- [HTML](https://github.com/rishabhrao/rdamn-template-html) - A Basic HTML, CSS and JS Starter Template.
- [Next.js](https://github.com/rishabhrao/rdamn-template-nextjs) - A Next.js Starter Template with Yarn as Package Manager.

---

## Getting Started

First, install [Node.js](https://nodejs.org) and then clone all repositories:

```bash
git clone https://github.com/rishabhrao/rdamn
git clone https://github.com/rishabhrao/rdamn-server
git clone https://github.com/rishabhrao/rdamn-playground
```

Install Dependencies for all repos:

```bash
cd rdamn
npm i
cd ../rdamn-server
npm i
cd ../rdamn-playground
npm i
cd ../
```

Start the Playground in Local Machine in Development mode:

```bash
cd rdamn-playground
npm run dev
```

OR

Start the Playground in a Local Docker Container in Development mode:

```bash
cd rdamn-playground
echo NODE_ENV=development >> .env
npm run dev:buildDocker
npm run dev:startDocker
```

Then in another terminal run the Next.js Development Server:

```bash
cd rdamn
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## Documentation

See Documentation [Here](https://docs.rdamn.cloud/)
