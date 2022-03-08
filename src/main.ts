import app from './routes';

app.listen(process.env.PORT_SERVER, () => {
    console.log(`App started.`);
});
