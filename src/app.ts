import KoaLogger from 'koa-logger';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { resolve } from 'path';
import { oas } from 'koa-oas3/lib';
import router from './routes';

const app = new Koa();

app.use(KoaLogger());
app.use(bodyParser());

const pathfile = resolve('./openapi.yaml');

oas({
    file: pathfile,
    endpoint: '/openapi.json',
    uiEndpoint: '/api/v1/docs',
}).then((oasMW) => {
    app.use(oasMW);
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
