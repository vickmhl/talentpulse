# GitHub Pages 上线步骤

这个项目已经加好了 GitHub Pages 自动部署文件：

- `.github/workflows/github-pages.yml`
- `.nojekyll`

你现在只需要做下面几步。

## 1. 把项目传到 GitHub

把整个项目文件夹上传到一个 GitHub 仓库里。

仓库建议公开，这样别人都能访问。

## 2. 打开 Pages 设置

进入你的 GitHub 仓库后：

1. 点 `Settings`
2. 点左侧 `Pages`
3. 在 `Build and deployment` 里把 `Source` 选成 `GitHub Actions`

## 3. 触发部署

只要你的代码已经在 `main` 或 `master` 分支，这个仓库里的工作流就会自动运行。

你也可以：

1. 点仓库上方 `Actions`
2. 找到 `Deploy to GitHub Pages`
3. 手动运行一次

## 4. 拿到网址

部署成功后，GitHub 会给你一个 Pages 地址，通常像这样：

`https://你的用户名.github.io/仓库名/`

如果你的仓库名刚好是 `你的用户名.github.io`，那地址通常就是：

`https://你的用户名.github.io/`

## 5. 发给别人访问

别人打开这个网址就能直接看你的 TalentPulse 页面。

## 如果没有成功

优先检查这几项：

- 仓库里是否已经有 `.github/workflows/github-pages.yml`
- `Pages` 里的 `Source` 是否选了 `GitHub Actions`
- 代码是否已经推送到 `main` 或 `master`
- `Actions` 页面里是否有报错
