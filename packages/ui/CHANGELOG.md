# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.3.0](https://github.com/li-yechao/paper/compare/@paper/ui@0.2.1...@paper/ui@0.3.0) (2022-01-11)

- feat!: use ipns directly ([ad527f4](https://github.com/li-yechao/paper/commit/ad527f4b40354ab2ff7dacf33f0bfd320505a436))

### BREAKING CHANGES

- use ipns directly, no longer use account server to
  implement publish.

## [0.2.1](https://github.com/li-yechao/paper/compare/@paper/ui@0.2.0...@paper/ui@0.2.1) (2021-12-30)

### Bug Fixes

- auto reset error boundary when route changed ([cbb093b](https://github.com/li-yechao/paper/commit/cbb093be59f5abf77132918b4e5d5cdf5966b72b))
- save paper correctly ([5ed749c](https://github.com/li-yechao/paper/commit/5ed749c211b68cbe8de5c58bd5d269076998b347))
- show error page when object is not exist ([021d768](https://github.com/li-yechao/paper/commit/021d7689bf50f4ca2c0ab9cd9c98ca06ae03f160))

# [0.2.0](https://github.com/li-yechao/paper/compare/@paper/ui@0.1.3...@paper/ui@0.2.0) (2021-12-27)

### Bug Fixes

- save paper on object id changed ([cdb2328](https://github.com/li-yechao/paper/commit/cdb2328398732d71ece2661b455bff84d2aa16b0))
- store before and after query to state ([61f0dc1](https://github.com/li-yechao/paper/commit/61f0dc1f7b5a184f1ba554b91657752e6a8d99d2))

### Features

- new layout on large screen ([ceed3f8](https://github.com/li-yechao/paper/commit/ceed3f8a896f3cf23ed0749f295c5caa1278023c))

## [0.1.3](https://github.com/li-yechao/paper/compare/@paper/ui@0.1.2...@paper/ui@0.1.3) (2021-12-23)

**Note:** Version bump only for package @paper/ui

## [0.1.2](https://github.com/li-yechao/paper/compare/@paper/ui@0.1.1...@paper/ui@0.1.2) (2021-12-21)

**Note:** Version bump only for package @paper/ui

## [0.1.1](https://github.com/li-yechao/paper/compare/@paper/ui@0.1.0...@paper/ui@0.1.1) (2021-12-20)

### Bug Fixes

- reload pagination after accountCID has changed ([80f8e7b](https://github.com/li-yechao/paper/commit/80f8e7b3c02fc00292515c1a89eb314d05b246bf))
- set app name ([28a9f3a](https://github.com/li-yechao/paper/commit/28a9f3a548276e93336de306e7234819fcf421bc))

# 0.1.0 (2021-12-15)

### Bug Fixes

- Correct hasPrevious when auto refresh objects ([aaba498](https://github.com/li-yechao/paper/commit/aaba498a4a19b138e9766bc7a8d360cced7159fa))
- Correct page after delete object ([12ec175](https://github.com/li-yechao/paper/commit/12ec17543ece6874d07dc24443631ac1564661a3))
- Load more data after delete if needed ([1c50c09](https://github.com/li-yechao/paper/commit/1c50c0982c31547bbb9d7d25c42bd96190398ab9))
- Publish if is new account ([5e43dfc](https://github.com/li-yechao/paper/commit/5e43dfcc17d5264adb79b64c666432d464f91b04))
- Recreate account after hot module replacemnet ([c6e8071](https://github.com/li-yechao/paper/commit/c6e8071f85d2cf1350b27393576965dce677a518))
- Return CID string to channel ([b95ec1e](https://github.com/li-yechao/paper/commit/b95ec1ed2008cbe297aaabb9e6acea6dcb48a3cb))
- Show prompt before navigate if has changes ([bc12e71](https://github.com/li-yechao/paper/commit/bc12e71376fbfb0d24b3136b6d4c833fe35d570f))
- Show update time ([db954f8](https://github.com/li-yechao/paper/commit/db954f8807b9fc35c7eb4838dbcfaaf14310e35e))
- Stop menu button click event ([ff4c301](https://github.com/li-yechao/paper/commit/ff4c3018edc90c83c0fa27085fa3aa92a3231200))
- The state of history is nullable ([ebf1c06](https://github.com/li-yechao/paper/commit/ebf1c06c903ef1935a9e1aafb86a5557cd4e0710))
- Upgrade schema ([bb2e0f8](https://github.com/li-yechao/paper/commit/bb2e0f872ddf1596a0677fff703ea20d747816db))
- Use useAsync instead of usePromise ([c87e27c](https://github.com/li-yechao/paper/commit/c87e27c9e9debc0fe61ca5e64a9829e7caae4f96))

### Features

- Add @paper/ui package ([1380060](https://github.com/li-yechao/paper/commit/13800605b8a6653cad7f1d57265502445c46436a))
- Add AppBar and support sign out ([48fde2b](https://github.com/li-yechao/paper/commit/48fde2bb743a3b20278e81b8f766fd776e71f8ce))
- Add block menu ([59e8493](https://github.com/li-yechao/paper/commit/59e84938b46c3327fbc2ec230533ab0cd71ad2ad))
- Add export button on header ([b28ac7b](https://github.com/li-yechao/paper/commit/b28ac7ba1e891931bf29faf51133a21d8d3510e9))
- Add NetworkIndicator ([27c9afd](https://github.com/li-yechao/paper/commit/27c9afde29003d2ddef61408c7c6d5ad793aa107))
- Add paper editor view ([e6d2180](https://github.com/li-yechao/paper/commit/e6d2180ea824f421becba479878ef6bb36ce34e0))
- Add PWA Support ([e2fd0fa](https://github.com/li-yechao/paper/commit/e2fd0fa68236f814c81854c4bac5dd78e313d5f1))
- Add router and error page ([ab9b03c](https://github.com/li-yechao/paper/commit/ab9b03cafd11b3979b4368fa452ba456904e8570))
- Add table support ([9ab881b](https://github.com/li-yechao/paper/commit/9ab881b8c720b0208761ee64d10b9cfa0f6ed03f))
- Add user view ([e511eed](https://github.com/li-yechao/paper/commit/e511eed30986937525d3fdc6fac09fc92dde8c92))
- Auto save ([3347c2f](https://github.com/li-yechao/paper/commit/3347c2f0eb7bc0a8e120e73aa6f53f71ecbb833b))
- Login view ([e6be7e7](https://github.com/li-yechao/paper/commit/e6be7e76647ce9b6419d43cc663772e28a8e9d21))
- ProseMirror editor ([710d142](https://github.com/li-yechao/paper/commit/710d14220228b7b2a35416c6699cc01b03c09521))
- Render info promise with Suspense and ErrorBoundary ([bd13e61](https://github.com/li-yechao/paper/commit/bd13e61c58c40fb018672feee70d1a5e79e1fd9c))
- Save title into info ([945e7eb](https://github.com/li-yechao/paper/commit/945e7eb5e1a2b873cdd11ddc63a4b48d1c94c2e4))
- Show object time ([4620239](https://github.com/li-yechao/paper/commit/4620239c2e82243472ca46ce9ff4ffea7fce956a))
- Show save button ([512da97](https://github.com/li-yechao/paper/commit/512da97d221f524773591890f97cad20da767d78))
- Show snackbar ([1fbbc02](https://github.com/li-yechao/paper/commit/1fbbc02336c845de870e08378f4cab9c1f413d57))
- Show tags in list ([c594b48](https://github.com/li-yechao/paper/commit/c594b4864d54427a6d36fd320a5a3dfdb7912988))
- Support add image ([c7e1ecf](https://github.com/li-yechao/paper/commit/c7e1ecf5509896abb5a4e45bf92a71ea44353a0e))
- Support auto update ([9d3a5cd](https://github.com/li-yechao/paper/commit/9d3a5cdd936dcedc9e40d5fc191a5fa96624216c))
- Support create account ([225f9b5](https://github.com/li-yechao/paper/commit/225f9b5a992d65494a79c5ffd2fc8689fc4e6b98))
- Support create and list draft ([da99812](https://github.com/li-yechao/paper/commit/da99812500af911c4b3b4947a641a7f02dddb912))
- Support dark mode ([1c393e5](https://github.com/li-yechao/paper/commit/1c393e556e42f81450b2d56e3cecfd1ebf42f5d3))
- Support delete draft ([a801f3c](https://github.com/li-yechao/paper/commit/a801f3cacda856582cecbf26818d7a06b42a4627))
- Support electron ([5b8700f](https://github.com/li-yechao/paper/commit/5b8700fa6761b4fa96cd9c86c1bddb2ccdd2a8c9))
- Support export to markdown ([2e18a2a](https://github.com/li-yechao/paper/commit/2e18a2acc9becbaf556a502e496f8988e2350b71))
- Support publish object ([ea39f36](https://github.com/li-yechao/paper/commit/ea39f3612b63760b09677ef3a44146a53759478e))
- Use ErrorBoundary as root element ([834a471](https://github.com/li-yechao/paper/commit/834a471ccc9720c8fb0376d7a15d8ce972447238))
