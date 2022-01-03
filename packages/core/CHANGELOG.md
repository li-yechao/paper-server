# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://github.com/li-yechao/paper/compare/@paper/core@0.2.0...@paper/core@0.2.1) (2022-01-12)

### Bug Fixes

- resolve name nocache flag ([d1d1c05](https://github.com/li-yechao/paper/commit/d1d1c051cd8d28f9be00bfdd91ce82a199baefef))

# [0.2.0](https://github.com/li-yechao/paper/compare/@paper/core@0.1.4...@paper/core@0.2.0) (2022-01-11)

- feat!: use ipns directly ([ad527f4](https://github.com/li-yechao/paper/commit/ad527f4b40354ab2ff7dacf33f0bfd320505a436))

### BREAKING CHANGES

- use ipns directly, no longer use account server to
  implement publish.

## [0.1.4](https://github.com/li-yechao/paper/compare/@paper/core@0.1.3...@paper/core@0.1.4) (2021-12-30)

### Bug Fixes

- ignore not found error ([b9cc781](https://github.com/li-yechao/paper/commit/b9cc781188958ba3868fe37d9a7b419f76c3bace))
- init object directory ([cb7ecbf](https://github.com/li-yechao/paper/commit/cb7ecbf27efed6a09bca2072026afb77a779e00a))
- show error page when object is not exist ([021d768](https://github.com/li-yechao/paper/commit/021d7689bf50f4ca2c0ab9cd9c98ca06ae03f160))

## [0.1.3](https://github.com/li-yechao/paper/compare/@paper/core@0.1.2...@paper/core@0.1.3) (2021-12-27)

**Note:** Version bump only for package @paper/core

## [0.1.2](https://github.com/li-yechao/paper/compare/@paper/core@0.1.1...@paper/core@0.1.2) (2021-12-23)

**Note:** Version bump only for package @paper/core

## [0.1.1](https://github.com/li-yechao/paper/compare/@paper/core@0.1.0...@paper/core@0.1.1) (2021-12-20)

### Bug Fixes

- catch resolveName exception ([2c6e1c9](https://github.com/li-yechao/paper/commit/2c6e1c9ac9af0185023657f7f9b725c16eabc637))
- cid is required when sync ipfs files ([524bd63](https://github.com/li-yechao/paper/commit/524bd63a7b99ebe5ff21e982dc7c12c26e1f651e))
- emit all server event to client ([9f05ec7](https://github.com/li-yechao/paper/commit/9f05ec71f884b3e2bddc1af0e64205e894495c15))
- local objects path maybe not exist ([78b66df](https://github.com/li-yechao/paper/commit/78b66dfe2ddaf1e04c4727b53a5daeae6a79a37f))
- stop ipfs if create account failed ([4e9f3f4](https://github.com/li-yechao/paper/commit/4e9f3f421c1b6201c83cd96a80e486a65e2357f1))

# 0.1.0 (2021-12-15)

### Bug Fixes

- Add new object to cache ([8776a4c](https://github.com/li-yechao/paper/commit/8776a4c39b6a7fbd69cb41d8633810e3b5fa833c))
- Connect swarm before copy user files ([05a6635](https://github.com/li-yechao/paper/commit/05a6635eb7c43d0bd0dd0aeec9253982e3bde29d))
- Correct create function type ([8b902f2](https://github.com/li-yechao/paper/commit/8b902f2cd7f61706fa0b07c198032caaf73f2178))
- Delete object maybe just a draft ([aae363c](https://github.com/li-yechao/paper/commit/aae363c569f3530a992e24ce3f4fe67d96752c8f))
- Publish api maybe return 201 status ([f66d610](https://github.com/li-yechao/paper/commit/f66d6102d47ca4baf174205529f77e3120789c7a))
- Publish if is new account ([5e43dfc](https://github.com/li-yechao/paper/commit/5e43dfcc17d5264adb79b64c666432d464f91b04))
- Reconnect to swarm if ping error ([353b09f](https://github.com/li-yechao/paper/commit/353b09f7c0a3cfec0a532a279e643be3b0190f67))
- Reload object info after publish ([dcd3f9d](https://github.com/li-yechao/paper/commit/dcd3f9d723fde668126458b4b136625adb70e9ad))
- Return CID string to channel ([b95ec1e](https://github.com/li-yechao/paper/commit/b95ec1ed2008cbe297aaabb9e6acea6dcb48a3cb))
- Should cache info ([4e1091c](https://github.com/li-yechao/paper/commit/4e1091c930b0435b7aee575d982b5d09e58b63c3))
- Use libp2pTransportFilter option ([8547591](https://github.com/li-yechao/paper/commit/8547591269d5f3d2a2954f6c12a98d7735d1326d))
- Wait init ([b61c3ef](https://github.com/li-yechao/paper/commit/b61c3efe3c07a6a06aae7198917de4faeaf19291))

### Features

- Add @paper/core package ([30afd27](https://github.com/li-yechao/paper/commit/30afd2753ec0ea3b3286aa4c455ce49d75770952))
- Add @paper/ipfs package ([4b473ae](https://github.com/li-yechao/paper/commit/4b473ae99a2bc1d2385e9d7355cdc6dffbc93d01))
- Add AppBar and support sign out ([48fde2b](https://github.com/li-yechao/paper/commit/48fde2bb743a3b20278e81b8f766fd776e71f8ce))
- Add createdAt and updatedAt field ([fc4b0eb](https://github.com/li-yechao/paper/commit/fc4b0ebe24b92a9953c2aeec537149d1e6265c91))
- Copy user files to MFS from IPFS ([8d3eeac](https://github.com/li-yechao/paper/commit/8d3eeac7463faf9e40fabf870fb30da03c165c2a))
- Encrypt object files ([13ec5e6](https://github.com/li-yechao/paper/commit/13ec5e64c1c1562eae47957996b78b8ad663eba6))
- Object and drafts api ([8ce6001](https://github.com/li-yechao/paper/commit/8ce6001fcebd772469131782a1ce9b84b46b83db))
- Show tags in list ([c594b48](https://github.com/li-yechao/paper/commit/c594b4864d54427a6d36fd320a5a3dfdb7912988))
- Support create account ([225f9b5](https://github.com/li-yechao/paper/commit/225f9b5a992d65494a79c5ffd2fc8689fc4e6b98))
- Support delete draft ([a801f3c](https://github.com/li-yechao/paper/commit/a801f3cacda856582cecbf26818d7a06b42a4627))
- Support open a draft ([b5f6d0a](https://github.com/li-yechao/paper/commit/b5f6d0afde1a77cd4f52efd43dc5944fce1e3f09))
- Support publish object ([ea39f36](https://github.com/li-yechao/paper/commit/ea39f3612b63760b09677ef3a44146a53759478e))
