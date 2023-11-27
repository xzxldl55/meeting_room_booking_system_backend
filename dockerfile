# build-stage 构建阶段
FROM node:18.0-alpine3.14 as build-stage

# 设定 docker 工作目录
WORKDIR /app

# 设定需要复制的文件：将当前目录下 package.json 拷贝到 docker 服务的 . 目录下（其实就是/app）
COPY package.json .

# 创建时需要执行的命令
RUN npm install

COPY . .

# 打包: RUN 是在镜像构建阶段就执行的命令
RUN npm run build

# 生产发布阶段
FROM node:18.0-alpine3.14 as production-stage

# 将上面打包阶段的产物复制过来
COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm install --production

# 端口映射：暴露 docker 服务的 3000 端口
EXPOSE 3000

# CMD 是容器运行时执行的命令：这里启动服务 ==> 等同于 ENTRYPOINT ["node", "/app/main.js"]
CMD ["node", "/app/main.js"]
