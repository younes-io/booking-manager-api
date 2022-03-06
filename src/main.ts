import Koa from 'koa';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import { oas } from 'koa-oas3';
import path from 'path';

const app = new Koa();

app.use(logger());
app.use(bodyParser());

const pathfile = path.resolve('./openapi.yaml');
console.log('openAPI file = ', pathfile);

const oasMw = await oas({
    file: pathfile,
    endpoint: '/openapi.json',
    uiEndpoint: '/api/v1/docs',
});

app.use(oasMw);

// response
app.use((ctx) => {
    ctx.body = 'Hello Younes!';
    console.log(ctx.body);
});

app.listen(3000);
