# 〔结构·L2〕容器图

```text
flowchart TB
    %% Name: 〔结构·L2〕容器图
    %% Slug: struct-l2-container
    Client[HTTP 客户端（http-client）]

    subgraph SYS["Demo 系统（demo）"]
        Server[HTTP 服务（server-js）· Node.js]
    end

    Client -->|HTTP:8080 同步请求| Server

    %% Legend:
    %%   -->   同步调用
    %%   -.->  异步通信
```

## Evidence

| Diagram element | Source evidence |
|---|---|
| HTTP 客户端（`http-client`） | `demo/server.js:3` receives the request as `req` in the HTTP server callback. |
| HTTP 服务（`server-js`） | `demo/server.js:1` imports Node's HTTP runtime; `demo/server.js:3` creates the server; `demo/server.js:7` starts its listener. |
| HTTP 客户端 → HTTP 服务 | `demo/server.js:3` defines the inbound HTTP request handler; `demo/server.js:7` binds it to port `8080`. |

`store.js` is intentionally not a container: `demo/server.js:2` imports it directly, `demo/server.js:4` invokes it in-process, and `demo/store.js:1-4` implements an in-memory `Map` lookup rather than an independently running datastore.
