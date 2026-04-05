# Changelog

## [0.2.0](https://github.com/Arunodoy18/TalentSync/compare/nextjs-new-v0.1.0...nextjs-new-v0.2.0) (2026-04-05)


### Features

* add ai chat assistant using 21st dev template and groq api ([8ce0af2](https://github.com/Arunodoy18/TalentSync/commit/8ce0af2eb2e43073c722fd675daee0c4f8872c2a))
* **ai:** implement job recommendation engine with cosine similarity ([25d0586](https://github.com/Arunodoy18/TalentSync/commit/25d0586c59074cc3df52b9e0478bb5842562ebe0))
* **analytics:** add admin ops dashboard and trend telemetry ([c6894c3](https://github.com/Arunodoy18/TalentSync/commit/c6894c3961fef676983564e5593a6271c0082cb2))
* **backend:** add secure API service with tests and workers ([35176c2](https://github.com/Arunodoy18/TalentSync/commit/35176c2a160977ff2b65f42aeb33979171942011))
* **billing:** add Razorpay subscriptions with 2-month trial flow ([8ac999d](https://github.com/Arunodoy18/TalentSync/commit/8ac999db00d44609a489f72fc1a34f18f64c0eaf))
* **billing:** harden webhook processing and reconciliation ([a7a1396](https://github.com/Arunodoy18/TalentSync/commit/a7a139681022e60c628365e04a393618b9799fc7))
* **core:** launch ready - AI Auto-Apply Engine & Master Vault ([3be1517](https://github.com/Arunodoy18/TalentSync/commit/3be15174f458264b6e7e26a33bddb0450e60fbc5))
* integrate 21st.dev animated AI chat template and wire to ai sdk ([06ba7b3](https://github.com/Arunodoy18/TalentSync/commit/06ba7b3020404bfaf303f008137f8b75a06a1a58))
* **nav:** expose pricing and billing links in dashboard ([65ab7bc](https://github.com/Arunodoy18/TalentSync/commit/65ab7bc2e0b74be6f94f8fdf8bb056811c0f6d0b))
* **paywall:** add soft upgrade gate for premium dashboard pages ([8f883a4](https://github.com/Arunodoy18/TalentSync/commit/8f883a4288b4a0fc4270081631e52a5456ca492a))
* **platform:** scaffold microservices runtime and orchestration ([b39c4e4](https://github.com/Arunodoy18/TalentSync/commit/b39c4e486f51d35938b9f2c3944e4b24a0759d84))
* production architecture, billing, analytics, and growth systems ([565c121](https://github.com/Arunodoy18/TalentSync/commit/565c1213bb3cf9b5e780603cc530975e78a2d50c))
* **theme:** add global gold theme and settings theme switcher ([4963cc4](https://github.com/Arunodoy18/TalentSync/commit/4963cc42f72b5b3cd361972b2882e34f0b88fa19))
* **theme:** apply global green palette and finalize resume flow split ([e6c6835](https://github.com/Arunodoy18/TalentSync/commit/e6c6835c2a9d5a5524827a0c19f74cf79cb61a5a))
* **ui:** add cinematic hero and premium pricing experience ([3558765](https://github.com/Arunodoy18/TalentSync/commit/3558765400a031aa9aa53d2b76b15859bd64757c))
* **ui:** implement dark indigo glassmorphism design system ([466c9dd](https://github.com/Arunodoy18/TalentSync/commit/466c9dd21418bed2c8c4a314a4312ded0ae8d886))
* **ui:** polish resume editor shell and responsive preview ([6a45791](https://github.com/Arunodoy18/TalentSync/commit/6a457910e81b84631384b1449fa205db34c3eb47))
* **ui:** unify premium design across dashboard and ATS flows ([9e51b82](https://github.com/Arunodoy18/TalentSync/commit/9e51b821702945a032e3b4f7debc58ff4c04038b))
* **ux:** elevate motion, scroll polish, and assistant performance ([fd07e6f](https://github.com/Arunodoy18/TalentSync/commit/fd07e6f46017da96e10f65088eddce860f979206))


### Bug Fixes

* **actions:** resolve CI setup and release-please config ([a6d7e06](https://github.com/Arunodoy18/TalentSync/commit/a6d7e0605bbf321f20d03ec56c2b2a1a711a529f))
* **actions:** soften release-please failure on permission blocks ([6ce8273](https://github.com/Arunodoy18/TalentSync/commit/6ce8273027a764678e2639cccd5685d1ee1cb542))
* **assistant:** harden chat streaming and message rendering ([9a6309d](https://github.com/Arunodoy18/TalentSync/commit/9a6309d35974556271543f66c0ad99cca00629fb))
* **assistant:** smooth auto-scroll, overflow stability, and Zap persona ([52ff056](https://github.com/Arunodoy18/TalentSync/commit/52ff056348f56c4d3ee50b4303ca5b3c2a97da3b))
* **backend:** isolate postcss config for tests ([2036e0b](https://github.com/Arunodoy18/TalentSync/commit/2036e0b7bbe7f691c949107f5921af8d22641fdb))
* **build:** resolve Netlify compile errors ([0b13fe9](https://github.com/Arunodoy18/TalentSync/commit/0b13fe9a2c48fbe65c3065c11d1ffb6add268f70))
* **chat:** enforce access in API and surface real backend errors ([3eb6568](https://github.com/Arunodoy18/TalentSync/commit/3eb656843b2cb3e196146b7a81040eabed2c2830))
* **ci:** isolate root typecheck and backend test runtime ([1c85a3e](https://github.com/Arunodoy18/TalentSync/commit/1c85a3e3aa6b2490460c1718aa7db37882ba6e59))
* **ci:** resolve typecheck failures and import issues ([e1cafb4](https://github.com/Arunodoy18/TalentSync/commit/e1cafb4991bdb4f0a87a3175508b66d8708910ea))
* **ci:** use legacy peer deps for root install ([b9f5bd7](https://github.com/Arunodoy18/TalentSync/commit/b9f5bd75b0596af273dab61931a75208b53d3888))
* **db:** harden supabase bootstrap for fresh projects ([8258ef0](https://github.com/Arunodoy18/TalentSync/commit/8258ef0c25a5e8095b43a88a042877c742be4686))
* **deploy:** force Node 18, standalone output, and rebuild lockfile for Netlify ([10cb22c](https://github.com/Arunodoy18/TalentSync/commit/10cb22ce0dec02dc310e66dc795c480b5809cfbf))
* **deploy:** include optional packages in npm install for tailwindcss oxide ([e6be8c0](https://github.com/Arunodoy18/TalentSync/commit/e6be8c063f41a4a0f319dcd5c0cdca60bcb3c103))
* encoding issue in builder page ([675c3ec](https://github.com/Arunodoy18/TalentSync/commit/675c3ecc4d7d250f86a66966011828d6094e7c45))
* improve input contrast and fix builder file encoding ([0ca4897](https://github.com/Arunodoy18/TalentSync/commit/0ca4897fc2ecc81a4a7e98df4994abec7fed2145))
* remove invalid output tracing root for Netlify runtime ([d61b48c](https://github.com/Arunodoy18/TalentSync/commit/d61b48cf1219b9da64ae657e6b0fd774a98fca20))
* replace pdf-parse with pdf2json to fix serverless parsing crashes and add missing applications route ([5b25a4d](https://github.com/Arunodoy18/TalentSync/commit/5b25a4d25df9cee36441ec40a45a6cdd57e91289))
* resolve dashboard 404 routes and harden middleware runtime ([e4f5f3e](https://github.com/Arunodoy18/TalentSync/commit/e4f5f3e7a83cd7463f21086a4c14b3eb6f591be9))
* **settings:** replace placeholder card with real account and billing settings view ([69c7574](https://github.com/Arunodoy18/TalentSync/commit/69c75741066c4b33357c2d1e428fdb24dccb7c31))
* **trial:** auto-provision free trial subscription for new users ([6637e33](https://github.com/Arunodoy18/TalentSync/commit/6637e33d93da6828c83e77818a08e7ac8e29243f))
* **ui:** harden hero runtime and remove legacy external branding assets ([d9f540a](https://github.com/Arunodoy18/TalentSync/commit/d9f540acf27eb981586d3e787a10651aebda0015))
* **ui:** harden Netlify build and lock assistant to internal scrolling ([0df6640](https://github.com/Arunodoy18/TalentSync/commit/0df66408185a6c1ed078678c60af45b9f31955c4))
* use client directive in applications page ([9bbd0bd](https://github.com/Arunodoy18/TalentSync/commit/9bbd0bd158fa5404200e32f6a56945d88228738c))
* use toUIMessageStreamResponse for AI chat to fix empty message render bug ([bedadc1](https://github.com/Arunodoy18/TalentSync/commit/bedadc1579d236b577f39827f520d31dbff56e25))


### Performance Improvements

* **ui:** optimize hero motion and pricing mobile polish ([3bf7c77](https://github.com/Arunodoy18/TalentSync/commit/3bf7c7758f3ead64822871f890a6806159852fa7))
