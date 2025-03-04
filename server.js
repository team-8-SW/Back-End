const app = require('./app.js');
const dotenv = require('dotenv');
dotenv.config({ path:  './config.env' });

console.log(process.env);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
