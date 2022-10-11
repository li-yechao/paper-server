## [1.1.0-alpha.5](https://github.com/li-yechao/paper-server/compare/v1.1.0-alpha.4...v1.1.0-alpha.5) (2022-10-11)

### Features

- only allow query public object if not the author ([ba22cea](https://github.com/li-yechao/paper-server/commit/ba22cea13a53b3ccc1a777219acbe0b4b76f2c1d))

## 1.1.0-alpha.4 (2022-10-09)

### ⚠ BREAKING CHANGES

- prepare rewrite all things
- rename paper to object
- rename ipfs.httpClient.uri to ipfs.api
- new server project
- use ipns directly, no longer use account server to
  implement publish.

### Features

- Add @paper/core package ([30afd27](https://github.com/li-yechao/paper-server/commit/30afd2753ec0ea3b3286aa4c455ce49d75770952))
- Add @paper/ipfs package ([4b473ae](https://github.com/li-yechao/paper-server/commit/4b473ae99a2bc1d2385e9d7355cdc6dffbc93d01))
- Add @paper/server package ([db6fdc6](https://github.com/li-yechao/paper-server/commit/db6fdc6b773836010c3ad5f5c6d3ab7f6964807b))
- Add @paper/ui package ([1380060](https://github.com/li-yechao/paper-server/commit/13800605b8a6653cad7f1d57265502445c46436a))
- add `BlockMenu` extension ([8e6ec94](https://github.com/li-yechao/paper-server/commit/8e6ec94e59c28c10f747a72c5c5d36873a523caa))
- add `EquationNode` ([9efdefa](https://github.com/li-yechao/paper-server/commit/9efdefa32e07187be6496118f9929b8f83853a5e))
- add `FloatingToolbar` ([f3b63d5](https://github.com/li-yechao/paper-server/commit/f3b63d57620352d8efe84427311a11b9fac74424))
- add `ImageNode` ([7e52585](https://github.com/li-yechao/paper-server/commit/7e52585d54884c83c46d6e0e5344228317647992))
- add `Table` node ([ca12422](https://github.com/li-yechao/paper-server/commit/ca124220fd8d9c4ede60ef174bd49bae7d1c700e))
- add `TrailingParagraphPlugin` ([6cb5394](https://github.com/li-yechao/paper-server/commit/6cb5394fd5b582bae0519635cea4f243caf55915))
- Add AppBar and support sign out ([48fde2b](https://github.com/li-yechao/paper-server/commit/48fde2bb743a3b20278e81b8f766fd776e71f8ce))
- Add block menu ([59e8493](https://github.com/li-yechao/paper-server/commit/59e84938b46c3327fbc2ec230533ab0cd71ad2ad))
- add CodeBlock and TodoList node ([3a35184](https://github.com/li-yechao/paper-server/commit/3a3518415b5709046c6f22413e05448f8c6c1ec2))
- add CodeBlock node ([#33](https://github.com/li-yechao/paper-server/issues/33)) ([98b3d78](https://github.com/li-yechao/paper-server/commit/98b3d7838339710bcc9b73041fecc8ee8d98f05f))
- Add createdAt and updatedAt field ([fc4b0eb](https://github.com/li-yechao/paper-server/commit/fc4b0ebe24b92a9953c2aeec537149d1e6265c91))
- Add export button on header ([b28ac7b](https://github.com/li-yechao/paper-server/commit/b28ac7ba1e891931bf29faf51133a21d8d3510e9))
- Add go-ipfs package to download go ipfs from github ([a3a78d4](https://github.com/li-yechao/paper-server/commit/a3a78d4d0014e57398822ce1fe00ee729f5e2c00))
- Add heading and blockquote menu ([7a202bb](https://github.com/li-yechao/paper-server/commit/7a202bbbbb9eb797eb38357ddc3dd75d371f5403))
- add ImageBlock node ([#27](https://github.com/li-yechao/paper-server/issues/27)) ([9d5e1ec](https://github.com/li-yechao/paper-server/commit/9d5e1ec63ab3d69e48d01d2947269d7aeedc5e91))
- add insert image menu ([a3de069](https://github.com/li-yechao/paper-server/commit/a3de0691696b1d50f5fbe0db76a173491358c257))
- add math support ([#24](https://github.com/li-yechao/paper-server/issues/24)) ([be52305](https://github.com/li-yechao/paper-server/commit/be5230550f28b4aa7de4320e209a0ba208e10cab))
- add menus to toogle block type ([17d0641](https://github.com/li-yechao/paper-server/commit/17d0641fa9f407ea29dbd1fb32ea89732486c720))
- Add NetworkIndicator ([27c9afd](https://github.com/li-yechao/paper-server/commit/27c9afde29003d2ddef61408c7c6d5ad793aa107))
- add object menu ([089e5d3](https://github.com/li-yechao/paper-server/commit/089e5d3d09e87c23efacab9c4c04440d813a43ac))
- add objectCreated subscription ([cdf6c9b](https://github.com/li-yechao/paper-server/commit/cdf6c9b5871545933ff439d657f1df4c3fa78c53))
- add paper controller ([03d5f06](https://github.com/li-yechao/paper-server/commit/03d5f06391f1221e5800633c03a1e8e9ec23cdd7))
- Add paper editor view ([e6d2180](https://github.com/li-yechao/paper-server/commit/e6d2180ea824f421becba479878ef6bb36ce34e0))
- add public tag ([9008e76](https://github.com/li-yechao/paper-server/commit/9008e76f554abfffccc40013c86db9c8b62d8483))
- add pwa support ([aa3be97](https://github.com/li-yechao/paper-server/commit/aa3be971e99770c79e7473eda379252279fe1f1f))
- Add PWA Support ([e2fd0fa](https://github.com/li-yechao/paper-server/commit/e2fd0fa68236f814c81854c4bac5dd78e313d5f1))
- Add resolve api ([fe8085b](https://github.com/li-yechao/paper-server/commit/fe8085b1c433c208cf522c3cf4e26405ea1f750f))
- Add router and error page ([ab9b03c](https://github.com/li-yechao/paper-server/commit/ab9b03cafd11b3979b4368fa452ba456904e8570))
- Add table support ([9ab881b](https://github.com/li-yechao/paper-server/commit/9ab881b8c720b0208761ee64d10b9cfa0f6ed03f))
- add TodoList node ([#38](https://github.com/li-yechao/paper-server/issues/38)) ([9ff340e](https://github.com/li-yechao/paper-server/commit/9ff340e0e5f6f2b5d89739c8f651e6b090b0f21c))
- add uri field for object ([#29](https://github.com/li-yechao/paper-server/issues/29)) ([149d8af](https://github.com/li-yechao/paper-server/commit/149d8af895134c8aa5480fc7c09eb8fc84b9c67c))
- add user resolver ([536a86c](https://github.com/li-yechao/paper-server/commit/536a86c4d264e1cebce2d35986275380c4f87ce2))
- Add user view ([e511eed](https://github.com/li-yechao/paper-server/commit/e511eed30986937525d3fdc6fac09fc92dde8c92))
- allow access paper without login ([fd0ca75](https://github.com/li-yechao/paper-server/commit/fd0ca750a1291adab6c226f2bb90f08509b1a5cd))
- allow click block menu to create node ([b81ee3c](https://github.com/li-yechao/paper-server/commit/b81ee3c9d3675b83c085a4fd3562f32fca975077))
- allow config expiresIn of signature ([2d2dfb0](https://github.com/li-yechao/paper-server/commit/2d2dfb01880f46175ea4e78467191f6359b20366))
- allow config via .env ([db550cb](https://github.com/li-yechao/paper-server/commit/db550cb606bfb1be2a55be903bc4f06810c52bba))
- allow drop image ([dc0c1af](https://github.com/li-yechao/paper-server/commit/dc0c1afd30ed4dacb6d75a701ee8821a01416077))
- auth view ([28d4c11](https://github.com/li-yechao/paper-server/commit/28d4c117a4aca548fa2cb9a2cafcd5100fc8a4ec))
- auto link ([cb52125](https://github.com/li-yechao/paper-server/commit/cb521256ac390afc240e1259c6ff6c35a7a8ce3a))
- Auto save ([3347c2f](https://github.com/li-yechao/paper-server/commit/3347c2f0eb7bc0a8e120e73aa6f53f71ecbb833b))
- auto save when doc changed ([4f84330](https://github.com/li-yechao/paper-server/commit/4f8433034c36d4031551fa153d01bf31df96e4a4))
- base editor support ([46d601a](https://github.com/li-yechao/paper-server/commit/46d601a31dad97fb7c0a739130b168678a7c88d4))
- block menu ([cd9c616](https://github.com/li-yechao/paper-server/commit/cd9c6168fe0b8618c9f0df16312ebfc5e5d6d656))
- Copy user files to MFS from IPFS ([8d3eeac](https://github.com/li-yechao/paper-server/commit/8d3eeac7463faf9e40fabf870fb30da03c165c2a))
- create a history record when object changed ([d35cb84](https://github.com/li-yechao/paper-server/commit/d35cb84301978d9cb8e5b9e591e76b53c8e0ead1))
- Encrypt object files ([13ec5e6](https://github.com/li-yechao/paper-server/commit/13ec5e64c1c1562eae47957996b78b8ad663eba6))
- equation editor ([33aca7d](https://github.com/li-yechao/paper-server/commit/33aca7d96ff3aec159c3e014fa0e969f0ac70003))
- give large aside in a large screen ([5bb3556](https://github.com/li-yechao/paper-server/commit/5bb355604582ad8e05cfc994557e8d03bd23e988))
- implement viewer resolver ([38acdbc](https://github.com/li-yechao/paper-server/commit/38acdbce13ef2d28ef839d461e65003b918da41d))
- infinite load objects ([f4b02f5](https://github.com/li-yechao/paper-server/commit/f4b02f560f906d8f76cd468db8a409333ec6dfaa))
- lexical editor ([0b5b045](https://github.com/li-yechao/paper-server/commit/0b5b045b14bb69e3373ef98fc4e3ee3dcf13cea9))
- load newly objects ([b656641](https://github.com/li-yechao/paper-server/commit/b6566416983c2c416b12d216e33031f96033a0cd))
- Login view ([e6be7e7](https://github.com/li-yechao/paper-server/commit/e6be7e76647ce9b6419d43cc663772e28a8e9d21))
- main view ([76137bb](https://github.com/li-yechao/paper-server/commit/76137bbf087f1986332fc3577040bf1f8167c154))
- new layout on large screen ([ceed3f8](https://github.com/li-yechao/paper-server/commit/ceed3f8a896f3cf23ed0749f295c5caa1278023c))
- no auto focus plugin ([f2087b0](https://github.com/li-yechao/paper-server/commit/f2087b0d81e1d8cfeb971b70f28793e29ebc6705))
- Object and drafts api ([8ce6001](https://github.com/li-yechao/paper-server/commit/8ce6001fcebd772469131782a1ce9b84b46b83db))
- object data support encoding by base64 ([#28](https://github.com/li-yechao/paper-server/issues/28)) ([bcb27bb](https://github.com/li-yechao/paper-server/commit/bcb27bbd883cfb83367de05a0263c8ff1a6daf99))
- object resolver ([46eeb18](https://github.com/li-yechao/paper-server/commit/46eeb185f6e17778a169b13202ec893636c4450b))
- object tree structure ([#26](https://github.com/li-yechao/paper-server/issues/26)) ([86018b9](https://github.com/li-yechao/paper-server/commit/86018b9ba078ace5be3b4dfa15d3a2bd251ffc15))
- prompt when leave editing ([b3e333e](https://github.com/li-yechao/paper-server/commit/b3e333e514e8b4b5ad483f978ee24bb5e7cb3a98))
- ProseMirror editor ([710d142](https://github.com/li-yechao/paper-server/commit/710d14220228b7b2a35416c6699cc01b03c09521))
- Render info promise with Suspense and ErrorBoundary ([bd13e61](https://github.com/li-yechao/paper-server/commit/bd13e61c58c40fb018672feee70d1a5e79e1fd9c))
- save aside collapsed state ([0cbeac6](https://github.com/li-yechao/paper-server/commit/0cbeac6b65743bab98e5f0f1570b93f407c04ca3))
- Save title into info ([945e7eb](https://github.com/li-yechao/paper-server/commit/945e7eb5e1a2b873cdd11ddc63a4b48d1c94c2e4))
- Show object time ([4620239](https://github.com/li-yechao/paper-server/commit/4620239c2e82243472ca46ce9ff4ffea7fce956a))
- Show save button ([512da97](https://github.com/li-yechao/paper-server/commit/512da97d221f524773591890f97cad20da767d78))
- Show snackbar ([1fbbc02](https://github.com/li-yechao/paper-server/commit/1fbbc02336c845de870e08378f4cab9c1f413d57))
- Show tags in list ([c594b48](https://github.com/li-yechao/paper-server/commit/c594b4864d54427a6d36fd320a5a3dfdb7912988))
- Support add image ([c7e1ecf](https://github.com/li-yechao/paper-server/commit/c7e1ecf5509896abb5a4e45bf92a71ea44353a0e))
- Support auto update ([9d3a5cd](https://github.com/li-yechao/paper-server/commit/9d3a5cdd936dcedc9e40d5fc191a5fa96624216c))
- support check list ([9c90582](https://github.com/li-yechao/paper-server/commit/9c9058207aec20e17d36a0b4830bf9589358e9f9))
- support collapse the list view ([de8e81a](https://github.com/li-yechao/paper-server/commit/de8e81a6446b2ff0f168d350e3b359f13d4aa97f))
- support config json limit ([#30](https://github.com/li-yechao/paper-server/issues/30)) ([3ea4627](https://github.com/li-yechao/paper-server/commit/3ea46278e9f2339a3bd8191e97c9ede3b2b57805))
- Support create account ([225f9b5](https://github.com/li-yechao/paper-server/commit/225f9b5a992d65494a79c5ffd2fc8689fc4e6b98))
- Support create and list draft ([da99812](https://github.com/li-yechao/paper-server/commit/da99812500af911c4b3b4947a641a7f02dddb912))
- support dark mode ([ed575f5](https://github.com/li-yechao/paper-server/commit/ed575f5664ac23b6823a7c7b19b5000319a183b8))
- Support dark mode ([1c393e5](https://github.com/li-yechao/paper-server/commit/1c393e556e42f81450b2d56e3cecfd1ebf42f5d3))
- Support delete draft ([a801f3c](https://github.com/li-yechao/paper-server/commit/a801f3cacda856582cecbf26818d7a06b42a4627))
- support delete object ([#37](https://github.com/li-yechao/paper-server/issues/37)) ([6fa5ddd](https://github.com/li-yechao/paper-server/commit/6fa5ddd96ac8c470f9e566f4c2c8ddd0712da2c7))
- Support electron ([5b8700f](https://github.com/li-yechao/paper-server/commit/5b8700fa6761b4fa96cd9c86c1bddb2ccdd2a8c9))
- Support export to markdown ([2e18a2a](https://github.com/li-yechao/paper-server/commit/2e18a2acc9becbaf556a502e496f8988e2350b71))
- support math ([d0633f2](https://github.com/li-yechao/paper-server/commit/d0633f26fd7be51d796cf5d7ef74d9a0de0708f2))
- Support Mod-[ and Mod-] shortcut for list item ([ccdb179](https://github.com/li-yechao/paper-server/commit/ccdb179a6713efc736004c7e92cd2da48eb4ebc3))
- support offset pagination ([be8b0c2](https://github.com/li-yechao/paper-server/commit/be8b0c2a5c2f3dc92374a469b3511a90ceb684a4))
- Support open a draft ([b5f6d0a](https://github.com/li-yechao/paper-server/commit/b5f6d0afde1a77cd4f52efd43dc5944fce1e3f09))
- Support publish object ([ea39f36](https://github.com/li-yechao/paper-server/commit/ea39f3612b63760b09677ef3a44146a53759478e))
- support readOnly prop ([09e078c](https://github.com/li-yechao/paper-server/commit/09e078ca8606c103859aa352970fd428bb6a3299))
- support upload image ([#31](https://github.com/li-yechao/paper-server/issues/31)) ([2876ebe](https://github.com/li-yechao/paper-server/commit/2876ebe5510dc4bd7fc99b6e839726770e2a4b4e))
- table menu ([e92a082](https://github.com/li-yechao/paper-server/commit/e92a082a3d731dbf82db376db3f948fcec48a62d))
- type `Shift-Enter` to split paragraph in table cell ([a09ed94](https://github.com/li-yechao/paper-server/commit/a09ed945c96291d2f16461e6e3c6955b777fc915))
- use `HistoryPlugin` ([598fcfe](https://github.com/li-yechao/paper-server/commit/598fcfe72a89895cd37e513974f68ae0f63bf63b))
- Use ErrorBoundary as root element ([834a471](https://github.com/li-yechao/paper-server/commit/834a471ccc9720c8fb0376d7a15d8ce972447238))
- use ErrorBoundary show error views ([#41](https://github.com/li-yechao/paper-server/issues/41)) ([884cd77](https://github.com/li-yechao/paper-server/commit/884cd772e749de533378fb70ce15d8715447c119))
- use github auth ([774da2d](https://github.com/li-yechao/paper-server/commit/774da2daaa73822aec66f85d2d281ca61a91e5ae))
- use ipns directly ([ad527f4](https://github.com/li-yechao/paper-server/commit/ad527f4b40354ab2ff7dacf33f0bfd320505a436))
- use lexical editor ([f7f9032](https://github.com/li-yechao/paper-server/commit/f7f903268280efd772f5db6cd03180f188b1130c))
- use textContent of first node as title ([da91c28](https://github.com/li-yechao/paper-server/commit/da91c28b0b95bf544f47a2d10a41af8a5971b18c))

### Bug Fixes

- add `--ipfs-api` args ([7f95937](https://github.com/li-yechao/paper-server/commit/7f9593719f74e00f86068f03d421772c971fb01f))
- add `filter` parameter ([e9d9c74](https://github.com/li-yechao/paper-server/commit/e9d9c74d097f9a345dd93cf46ff396ac2c45e168))
- add `override` modifier ([6ffe243](https://github.com/li-yechao/paper-server/commit/6ffe243c855ee4a7445a1c63eaf325ccbbee1c5d))
- add array polyfills ([8932538](https://github.com/li-yechao/paper-server/commit/89325384eb2b0d3f2467558f5dfdf227e1e274fb))
- Add new object to cache ([8776a4c](https://github.com/li-yechao/paper-server/commit/8776a4c39b6a7fbd69cb41d8633810e3b5fa833c))
- allow click block menu ([84140f7](https://github.com/li-yechao/paper-server/commit/84140f728ea65e18264b8c218b64e8e2315282ac))
- allow view object without auth ([df683fa](https://github.com/li-yechao/paper-server/commit/df683fa07857e3fbd90b69b669ca22299457a074))
- arrow not visible ([258febb](https://github.com/li-yechao/paper-server/commit/258febb9e24929e3a63599fc38e073e59a737f1f))
- auto reset error boundary when route changed ([cbb093b](https://github.com/li-yechao/paper-server/commit/cbb093be59f5abf77132918b4e5d5cdf5966b72b))
- avoid recreate editor with same object ([17d5aaf](https://github.com/li-yechao/paper-server/commit/17d5aaf925022e5228f7d1083ac4d52015e12979))
- avoid undefined children in ErrorBoundary ([#43](https://github.com/li-yechao/paper-server/issues/43)) ([e56bc2b](https://github.com/li-yechao/paper-server/commit/e56bc2b9646302f063b54b772f189fe026b9d756))
- await signature verification ([ad663e4](https://github.com/li-yechao/paper-server/commit/ad663e4a6ce7752c80ef0acd50014b9d411da2c9))
- catch resolveName exception ([2c6e1c9](https://github.com/li-yechao/paper-server/commit/2c6e1c9ac9af0185023657f7f9b725c16eabc637))
- check deleting selection is not empty ([adfa81c](https://github.com/li-yechao/paper-server/commit/adfa81c8c418e1c79a9d6c07e64ca6f845bd87d1))
- cid is required when sync ipfs files ([524bd63](https://github.com/li-yechao/paper-server/commit/524bd63a7b99ebe5ff21e982dc7c12c26e1f651e))
- clear apollo store and navigate to index after logout ([1c56531](https://github.com/li-yechao/paper-server/commit/1c56531302bffba2c8680a1fb7fa29f6e607eee5))
- Connect swarm before copy user files ([05a6635](https://github.com/li-yechao/paper-server/commit/05a6635eb7c43d0bd0dd0aeec9253982e3bde29d))
- correct aside spacing ([c77a633](https://github.com/li-yechao/paper-server/commit/c77a633b8091ca146fe7cec04735e10ec106493e))
- Correct create function type ([8b902f2](https://github.com/li-yechao/paper-server/commit/8b902f2cd7f61706fa0b07c198032caaf73f2178))
- Correct figcaption schema ([ef47f45](https://github.com/li-yechao/paper-server/commit/ef47f451737c30271e17ede1a0c8ef03e6ec9e03))
- correct gap icon position in blockquote ([a2ec3c7](https://github.com/li-yechao/paper-server/commit/a2ec3c72c6d942eba7a172a47a99f4bb6b865285))
- Correct hasPrevious when auto refresh objects ([aaba498](https://github.com/li-yechao/paper-server/commit/aaba498a4a19b138e9766bc7a8d360cced7159fa))
- Correct list item paste ([74be4c4](https://github.com/li-yechao/paper-server/commit/74be4c480cc3a622fc5ed65ed5b7653c36f182ca))
- Correct page after delete object ([12ec175](https://github.com/li-yechao/paper-server/commit/12ec17543ece6874d07dc24443631ac1564661a3))
- correct select position after `CodeBlock` deleted ([32974ec](https://github.com/li-yechao/paper-server/commit/32974ec419c2f8f00097843699b5c28254ed11f4))
- correct vertical position of floating toolbar ([d85cdc3](https://github.com/li-yechao/paper-server/commit/d85cdc3beeb6f5afb9a9001883c5f3dc0d886fbf))
- correctly create lexical node ([69a0078](https://github.com/li-yechao/paper-server/commit/69a0078ffdb5063ff5ba42ee96b20ebefdad887b))
- Delete object maybe just a draft ([aae363c](https://github.com/li-yechao/paper-server/commit/aae363c569f3530a992e24ce3f4fe67d96752c8f))
- disable graphql cors option ([81cffdb](https://github.com/li-yechao/paper-server/commit/81cffdb498bbba982e27af460717d1889269db85))
- dont check todo item after split it ([671c5a8](https://github.com/li-yechao/paper-server/commit/671c5a88cd2a717fb45a03ed60e51b7943627871))
- dont display zero character in selection ([fc7f715](https://github.com/li-yechao/paper-server/commit/fc7f71556f73a6ae1c0452293fa21f90b8570e54))
- Dont use component selector ([c44a7c0](https://github.com/li-yechao/paper-server/commit/c44a7c0d8a092d0641570a90182787ae519da60e))
- emit all server event to client ([9f05ec7](https://github.com/li-yechao/paper-server/commit/9f05ec71f884b3e2bddc1af0e64205e894495c15))
- enable name over pubsub ([ea713ac](https://github.com/li-yechao/paper-server/commit/ea713ac530039c577bf688e678b6b387369754c9))
- Expose gateway ([a181ee3](https://github.com/li-yechao/paper-server/commit/a181ee34ac7307201ef3f2d40cc5963242aace1b))
- fetch object list after create first object ([e25888b](https://github.com/li-yechao/paper-server/commit/e25888b7bc249541fb6061dff644e167c8905468))
- FloatingToolbar can not be closed in sometime ([1dd49b4](https://github.com/li-yechao/paper-server/commit/1dd49b47644a4595808056ce5b202644b72defaa))
- get saved state by deep compare doc ([2ca1972](https://github.com/li-yechao/paper-server/commit/2ca1972694e397f5331d0b1debcff74eaaaf9c27))
- get thumbnail of image ([b638a98](https://github.com/li-yechao/paper-server/commit/b638a980728650a4ba2a7a420a932ec78e122f90))
- ignore all toolbar events until the selection is complete ([a8d0dc1](https://github.com/li-yechao/paper-server/commit/a8d0dc18d48e760b008c09f632dfe78949fc6cc5))
- ignore not found error ([b9cc781](https://github.com/li-yechao/paper-server/commit/b9cc781188958ba3868fe37d9a7b419f76c3bace))
- init object directory ([cb7ecbf](https://github.com/li-yechao/paper-server/commit/cb7ecbf27efed6a09bca2072026afb77a779e00a))
- it is not run in electron ([532b82f](https://github.com/li-yechao/paper-server/commit/532b82f38eff6bad6c125bd8ff70f3bca8c2cf9e))
- Load more data after delete if needed ([1c50c09](https://github.com/li-yechao/paper-server/commit/1c50c0982c31547bbb9d7d25c42bd96190398ab9))
- local objects path maybe not exist ([78b66df](https://github.com/li-yechao/paper-server/commit/78b66dfe2ddaf1e04c4727b53a5daeae6a79a37f))
- multiple editor instance use one dom element ([0f4ed58](https://github.com/li-yechao/paper-server/commit/0f4ed58e0b38d456dd9753f3a51b950cf69358fb))
- nowrap title ([#25](https://github.com/li-yechao/paper-server/issues/25)) ([9b48965](https://github.com/li-yechao/paper-server/commit/9b489650ae474ab70af9847259fda6cfe570d031))
- only use hover in pc browser ([5e74933](https://github.com/li-yechao/paper-server/commit/5e74933a6bebb5073c57f5030bba3c47babd5291))
- prmopt not display when changed state not changed ([d395586](https://github.com/li-yechao/paper-server/commit/d39558683bec4d2289280652d80c618762d3ee11))
- Publish api maybe return 201 status ([f66d610](https://github.com/li-yechao/paper-server/commit/f66d6102d47ca4baf174205529f77e3120789c7a))
- Publish if is new account ([5e43dfc](https://github.com/li-yechao/paper-server/commit/5e43dfcc17d5264adb79b64c666432d464f91b04))
- query object by network always ([cf31380](https://github.com/li-yechao/paper-server/commit/cf3138058e184d266c589dbf42e267213e061616))
- query object uri by user id ([a27308b](https://github.com/li-yechao/paper-server/commit/a27308b9ea873dd02c2f32fcbd31266a2ea56edb))
- read only editor if the object is not owned ([5bbbeb0](https://github.com/li-yechao/paper-server/commit/5bbbeb0a134556252a63d5c12d5726bf309b5d75))
- read only when not authed ([93878f4](https://github.com/li-yechao/paper-server/commit/93878f4292feedf1c673c74610d6a217d7fcde98))
- Reconnect to swarm if ping error ([353b09f](https://github.com/li-yechao/paper-server/commit/353b09f7c0a3cfec0a532a279e643be3b0190f67))
- Recreate account after hot module replacemnet ([c6e8071](https://github.com/li-yechao/paper-server/commit/c6e8071f85d2cf1350b27393576965dce677a518))
- Reload object info after publish ([dcd3f9d](https://github.com/li-yechao/paper-server/commit/dcd3f9d723fde668126458b4b136625adb70e9ad))
- reload pagination after accountCID has changed ([80f8e7b](https://github.com/li-yechao/paper-server/commit/80f8e7b3c02fc00292515c1a89eb314d05b246bf))
- remove `contenteditable` attribute in `ImageBlock` ([9565cba](https://github.com/li-yechao/paper-server/commit/9565cba75559c681d46e25204a48d950b7dc5395))
- remove auth guard for object query ([8b7a620](https://github.com/li-yechao/paper-server/commit/8b7a620051f10dd077ce1a95b15c66971d95c56e))
- remove default value for cors ([947cadc](https://github.com/li-yechao/paper-server/commit/947cadc81fbcada9b55cb50560363f4923e329ca))
- remove object from list after deleted ([5f46d81](https://github.com/li-yechao/paper-server/commit/5f46d8125dcd82809a092edc91b7b3b11d7f3d29))
- remove schame parameter ([f871f2b](https://github.com/li-yechao/paper-server/commit/f871f2bd60bd0649e22d3023e5bd2fbd2dbfaac0))
- resolve name nocache flag ([d1d1c05](https://github.com/li-yechao/paper-server/commit/d1d1c051cd8d28f9be00bfdd91ce82a199baefef))
- Return CID string to channel ([b95ec1e](https://github.com/li-yechao/paper-server/commit/b95ec1ed2008cbe297aaabb9e6acea6dcb48a3cb))
- safari selection not visible ([598983e](https://github.com/li-yechao/paper-server/commit/598983ebfffd9b16cdf554700eebb6afe3ea07c7))
- save paper correctly ([5ed749c](https://github.com/li-yechao/paper-server/commit/5ed749c211b68cbe8de5c58bd5d269076998b347))
- save paper on object id changed ([cdb2328](https://github.com/li-yechao/paper-server/commit/cdb2328398732d71ece2661b455bff84d2aa16b0))
- scroll to top after navigate to the new paper ([82ecbb8](https://github.com/li-yechao/paper-server/commit/82ecbb813a1318c50f75523856dafe5d3091939d))
- select start after insert block node ([bde1fe0](https://github.com/li-yechao/paper-server/commit/bde1fe098ab83100457f2bd450fe164d33c6fd56))
- set `contenteditable` to `false` to allow copy image in `ImageBlock` ([8f2e378](https://github.com/li-yechao/paper-server/commit/8f2e378b28b989704adb9f59f64c1ad18daabc2e))
- set `ignoreUndefined` option for mongo connection ([f8b2452](https://github.com/li-yechao/paper-server/commit/f8b2452cfa1a3201f49c7aa875591842758c52a6))
- set app name ([28a9f3a](https://github.com/li-yechao/paper-server/commit/28a9f3a548276e93336de306e7234819fcf421bc))
- Should cache info ([4e1091c](https://github.com/li-yechao/paper-server/commit/4e1091c930b0435b7aee575d982b5d09e58b63c3))
- show error page when object is not exist ([021d768](https://github.com/li-yechao/paper-server/commit/021d7689bf50f4ca2c0ab9cd9c98ca06ae03f160))
- Show prompt before navigate if has changes ([bc12e71](https://github.com/li-yechao/paper-server/commit/bc12e71376fbfb0d24b3136b6d4c833fe35d570f))
- Show update time ([db954f8](https://github.com/li-yechao/paper-server/commit/db954f8807b9fc35c7eb4838dbcfaaf14310e35e))
- stop ipfs if create account failed ([4e9f3f4](https://github.com/li-yechao/paper-server/commit/4e9f3f421c1b6201c83cd96a80e486a65e2357f1))
- Stop menu button click event ([ff4c301](https://github.com/li-yechao/paper-server/commit/ff4c3018edc90c83c0fa27085fa3aa92a3231200))
- store before and after query to state ([61f0dc1](https://github.com/li-yechao/paper-server/commit/61f0dc1f7b5a184f1ba554b91657752e6a8d99d2))
- strict check timestamp ([38b6bd9](https://github.com/li-yechao/paper-server/commit/38b6bd96b84668050621b63692b50ac21be4d5d2))
- The state of history is nullable ([ebf1c06](https://github.com/li-yechao/paper-server/commit/ebf1c06c903ef1935a9e1aafb86a5557cd4e0710))
- throw apollo error ([31aa476](https://github.com/li-yechao/paper-server/commit/31aa476b3fae74639174371191ca8c6fad269fde))
- type error ([5ae58f9](https://github.com/li-yechao/paper-server/commit/5ae58f90051fc2f189986e35754cad8676319eee))
- upgrade github auth redirect uri ([ac1f5a8](https://github.com/li-yechao/paper-server/commit/ac1f5a8bf12e4f9301d95be1506304fc7fc14496))
- upgrade lexical api ([aa886a0](https://github.com/li-yechao/paper-server/commit/aa886a0731e4d156b9e95f779c99da5c304e9f53))
- upgrade lexical grid api ([a58afc1](https://github.com/li-yechao/paper-server/commit/a58afc17154fc3a51362a5d07b4818db3a8a84f0))
- Upgrade schema ([bb2e0f8](https://github.com/li-yechao/paper-server/commit/bb2e0f872ddf1596a0677fff703ea20d747816db))
- use fast-deep-equal/es6 ([7aa507b](https://github.com/li-yechao/paper-server/commit/7aa507b078cdde7e6a4a395be3c5fb59e5628271))
- Use libp2pTransportFilter option ([8547591](https://github.com/li-yechao/paper-server/commit/8547591269d5f3d2a2954f6c12a98d7735d1326d))
- use Suspence wrap ObjectEditorLazy ([43ed6b8](https://github.com/li-yechao/paper-server/commit/43ed6b83c242cf1959f0f8cf034cf29b3c165ba1))
- Use useAsync instead of usePromise ([c87e27c](https://github.com/li-yechao/paper-server/commit/c87e27c9e9debc0fe61ca5e64a9829e7caae4f96))
- vertical align center checkbox ([a897fce](https://github.com/li-yechao/paper-server/commit/a897fcecdd6224acee5f4fdf5871605b7067d0ba))
- Wait init ([b61c3ef](https://github.com/li-yechao/paper-server/commit/b61c3efe3c07a6a06aae7198917de4faeaf19291))

### Miscellaneous Chores

- new server project ([b18a0cd](https://github.com/li-yechao/paper-server/commit/b18a0cd0641c3e5b3b4ee3b8f086719219733a61))

### Code Refactoring

- prepare rewrite all things ([91cf016](https://github.com/li-yechao/paper-server/commit/91cf0161fc48c1719766d97cec25739981e941e9))
- rename ipfs.httpClient.uri to ipfs.api ([cc4d2c3](https://github.com/li-yechao/paper-server/commit/cc4d2c3406101cbd2422d586cc88448524b8e8d6))
- rename paper to object ([682e19f](https://github.com/li-yechao/paper-server/commit/682e19fd5f9edf3151ebe2610e6d131734400f81))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.1.0-alpha.3](https://github.com/li-yechao/paper/compare/@paper/server@1.1.0-alpha.2...@paper/server@1.1.0-alpha.3) (2022-10-08)

### Bug Fixes

- type error ([5ae58f9](https://github.com/li-yechao/paper/commit/5ae58f90051fc2f189986e35754cad8676319eee))

### Features

- add public tag ([9008e76](https://github.com/li-yechao/paper/commit/9008e76f554abfffccc40013c86db9c8b62d8483))
- support offset pagination ([be8b0c2](https://github.com/li-yechao/paper/commit/be8b0c2a5c2f3dc92374a469b3511a90ceb684a4))

# [1.1.0-alpha.2](https://github.com/li-yechao/paper/compare/@paper/server@1.1.0-alpha.1...@paper/server@1.1.0-alpha.2) (2022-07-18)

**Note:** Version bump only for package @paper/server

# [1.1.0-alpha.1](https://github.com/li-yechao/paper/compare/@paper/server@1.1.0-alpha.0...@paper/server@1.1.0-alpha.1) (2022-07-13)

**Note:** Version bump only for package @paper/server

# [1.1.0-alpha.0](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.9...@paper/server@1.1.0-alpha.0) (2022-07-13)

### Features

- use github auth ([774da2d](https://github.com/li-yechao/paper/commit/774da2daaa73822aec66f85d2d281ca61a91e5ae))

# [1.0.0-alpha.9](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.8...@paper/server@1.0.0-alpha.9) (2022-04-13)

**Note:** Version bump only for package @paper/server

# [1.0.0-alpha.8](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.7...@paper/server@1.0.0-alpha.8) (2022-04-13)

### Features

- create a history record when object changed ([d35cb84](https://github.com/li-yechao/paper/commit/d35cb84301978d9cb8e5b9e591e76b53c8e0ead1))

# [1.0.0-alpha.7](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.6...@paper/server@1.0.0-alpha.7) (2022-04-08)

### Bug Fixes

- set `ignoreUndefined` option for mongo connection ([f8b2452](https://github.com/li-yechao/paper/commit/f8b2452cfa1a3201f49c7aa875591842758c52a6))

# [1.0.0-alpha.6](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.5...@paper/server@1.0.0-alpha.6) (2022-03-30)

### Bug Fixes

- remove auth guard for object query ([8b7a620](https://github.com/li-yechao/paper/commit/8b7a620051f10dd077ce1a95b15c66971d95c56e))

# [1.0.0-alpha.5](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.4...@paper/server@1.0.0-alpha.5) (2022-03-29)

**Note:** Version bump only for package @paper/server

# [1.0.0-alpha.4](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.3...@paper/server@1.0.0-alpha.4) (2022-03-28)

**Note:** Version bump only for package @paper/server

# [1.0.0-alpha.3](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.2...@paper/server@1.0.0-alpha.3) (2022-03-26)

### Features

- add uri field for object ([#29](https://github.com/li-yechao/paper/issues/29)) ([149d8af](https://github.com/li-yechao/paper/commit/149d8af895134c8aa5480fc7c09eb8fc84b9c67c))
- object data support encoding by base64 ([#28](https://github.com/li-yechao/paper/issues/28)) ([bcb27bb](https://github.com/li-yechao/paper/commit/bcb27bbd883cfb83367de05a0263c8ff1a6daf99))
- object tree structure ([#26](https://github.com/li-yechao/paper/issues/26)) ([86018b9](https://github.com/li-yechao/paper/commit/86018b9ba078ace5be3b4dfa15d3a2bd251ffc15))
- support config json limit ([#30](https://github.com/li-yechao/paper/issues/30)) ([3ea4627](https://github.com/li-yechao/paper/commit/3ea46278e9f2339a3bd8191e97c9ede3b2b57805))

# [1.0.0-alpha.2](https://github.com/li-yechao/paper/compare/@paper/server@1.0.0-alpha.1...@paper/server@1.0.0-alpha.2) (2022-03-25)

### Bug Fixes

- add `--ipfs-api` args ([7f95937](https://github.com/li-yechao/paper/commit/7f9593719f74e00f86068f03d421772c971fb01f))
- disable graphql cors option ([81cffdb](https://github.com/li-yechao/paper/commit/81cffdb498bbba982e27af460717d1889269db85))

# [1.0.0-alpha.1](https://github.com/li-yechao/paper/compare/@paper/server@0.2.0-alpha.4...@paper/server@1.0.0-alpha.1) (2022-03-24)

### Bug Fixes

- add `filter` parameter ([e9d9c74](https://github.com/li-yechao/paper/commit/e9d9c74d097f9a345dd93cf46ff396ac2c45e168))

### Features

- add objectCreated subscription ([cdf6c9b](https://github.com/li-yechao/paper/commit/cdf6c9b5871545933ff439d657f1df4c3fa78c53))
- add user resolver ([536a86c](https://github.com/li-yechao/paper/commit/536a86c4d264e1cebce2d35986275380c4f87ce2))
- allow config expiresIn of signature ([2d2dfb0](https://github.com/li-yechao/paper/commit/2d2dfb01880f46175ea4e78467191f6359b20366))
- implement viewer resolver ([38acdbc](https://github.com/li-yechao/paper/commit/38acdbce13ef2d28ef839d461e65003b918da41d))
- object resolver ([46eeb18](https://github.com/li-yechao/paper/commit/46eeb185f6e17778a169b13202ec893636c4450b))
