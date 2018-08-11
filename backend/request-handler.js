const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const username = 'postgres';
const password = 'postgres';
const connection = 'postgres://' + username + ":" + password + '@localhost:5432/herbakkers';
var client = new pg.Client(connection);
client.connect();
const jwt = require('jsonwebtoken');

const secret = 'secret code'; //TODO make this secret

/**
 * execute callback if request is from admin
 * @param req
 * @param res
 * @param callb
 */
function isAdmin(req, res, callb) {
    var token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        if (decoded.id == 1) { // admin
            callb();
        } else { // no permission
            return res.status(403).send( {auth: false, message: 'Only admins can access this page.'} );
        }
    });
}


/**
 * execute callback if request is from the bar(user)
 * @param req
 * @param res
 * @param callb
 */
function isBarUser(req, res, callb) {
    var token = req.headers['x-access-token'];
    var userId = req.params['userId'];

    if (!token) {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        if (decoded.id == userId) { // bar of the user
            callb();
        } else { // no permission
            return res.status(403).send( {auth: false, message: 'No access for this account.'} );
        }
    });
}




// bar route
exports.getDrinks = (req, res) => {
    const drinks = [];
    const query = client.query('SELECT * FROM drinks');

    isBarUser(req, res, () => {
        query.on('row', (row) => {
            drinks.push(row);
        });
        query.on('end', () => {
            return res.json(drinks);
        });
    });
};


// bar route
//updates stock and sales
exports.placeOrder = (req, res) => {
    const userId = req.params['userId'];
    const orders = req.body['orders'];

    isBarUser(req, res, () => {
        if (userId == 1) {
            console.log('Error: admin has no stock');
            return res.status(417).send("Admin has no stock");
        } else {
            var now = new Date();
            console.log(orders);
            for (var i in orders) {
                var drinkName = Object.keys(orders[i])[0];
                var amount = orders[i][drinkName];
                //TODO optimize: one request for all orders

                //update stock
                client.query('UPDATE stock SET amount = amount - $1 ' +
                    'WHERE user_id = $2 AND drink_name = $3', [amount, userId, drinkName]);

                //add sales
                for (var j = 0; j < amount; j++) {
                    client.query('INSERT INTO sales (user_id, drink_name, sale_timestamp)' +
                        'VALUES ($1, $2, $3)', [userId, drinkName, now]);
                }
            }
            return res.send( {"create order": "succeeded"} );
        }
    });
};


// admin route
exports.getStock = (req, res) => {
    const stock = [];
    const params = req.params;

    isAdmin(req, res, () => {
        if (params['userId'] == 1) {
            console.log('Error: admin has no stock');
            return res.status(417).send("Admin has no stock");
        } else {
            const query = client.query('SELECT * FROM stock WHERE user_id = $1', [params['userId']]);
            query.on('row', (row) => {
                stock.push(row);
            });
            query.on('end', () => {
                return res.status(200).json(stock);
            });
        }
    });
};


// admin route
exports.updateStock = (req, res) => {
    const params = req.params;
    const amount = req.body.amount;
    const userId = params['userId'];
    const drinkName = params['drinkName'];

    isAdmin(req, res, () => {
        if (userId == 1) {
            console.log('Error: admin has no stock');
            return res.status(417).send("Admin has no stock");
        } else {
            const query = client.query('UPDATE stock SET amount = $1 ' +
                'WHERE user_id = $2 AND drink_name = $3', [amount, userId, drinkName]);
            query.on('end', () => {
                return res.send( {"update stock": "succeeded"} );
            });
        }
    });
};


// admin route
exports.getSales = (req, res) => {
    const sales = [];
    const query = client.query('SELECT * FROM sales');

    isAdmin(req, res, () => {
        query.on('row', (row) => {
            sales.push(row);
        });
        query.on('end', () => {
            console.log(sales);
            return res.json(sales);
        });
    });
};


// route for everybody (no token required)
exports.login = (req, res) => {
    const json = req.body;
    var user = json["login"];
    var password = json["password"];

    client.query('SELECT * FROM users WHERE name = $1', [user], function (error, result) {
        var hashedPassword = result.rows[0]['password'];
        var userId = result.rows[0]['id'];
        bcrypt.compare(password, hashedPassword, function(err1, res1) {
            if (res) {
                console.log("valid login for user: " + userId);
                var token = jwt.sign( {id: userId}, secret, { expiresIn: 86400 });
                console.log(token);
                return res.status(200).send({auth: true, token: token});
            } else {
                console.log('invalid password or username');
                return res.status(401);
            }
        });
    });
};



