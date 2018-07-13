const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const username = 'postgres';
const password = 'postgres';
const connection = 'postgres://' + username + ":" + password + '@localhost:5432/herbakkers';
var client = new pg.Client(connection);
client.connect();


exports.getUsers = (req, res) => {
    const users = [];
    const query = client.query('SELECT * FROM users');
    query.on('row', (row) => {
       users.push([row.id, row.name]);
    });
    query.on('end', () => {
        console.log(users);
        return res.json(users);
    });
};


exports.getDrinks = (req, res) => {
    const drinks = [];
    const query = client.query('SELECT * FROM drinks');
    query.on('row', (row) => {
        drinks.push(row);
    });
    query.on('end', () => {
        console.log(drinks);
        return res.json(drinks);
    });
};

//updates stock and sales
exports.placeOrder = (req, res) => {
    const userId = req.params['userId'];
    const orders = req.body.orders;

    //update stock

    //add sales
    if (userId == 1) {
        console.log('Error: admin has no stock');
        return res.status(417).send("Admin has no stock");
    } else {
        var now = new Date();
        for (var i in orders) {
            console.log(orders[i]);
            const query = client.query('INSERT INTO sales (user_id, drink_name, sale_timestamp)' +
                'VALUES ($1, $2, $3)', [userId, orders[i], now]);
        }
        return res.status(200);
    }

};


exports.getStock = (req, res) => {
    const stock = [];
    const params = req.params;
    if (params['userId'] == 1) {
        console.log('Error: admin has no stock');
        return res.status(417).send("Admin has no stock");
    } else {
        const query = client.query('SELECT * FROM stock WHERE user_id = $1', [params['userId']]);
        query.on('row', (row) => {
            stock.push(row);
        });
        query.on('end', () => {
            console.log(stock);
            return res.json(stock);
        });
    }
};


exports.updateStock = (req, res) => {
    const stock = [];
    const params = req.params;
    const amount = req.body.amount;
    const userId = params['userId'];
    const drinkName = params['drinkName'];
    if (userId == 1) {
        console.log('Error: admin has no stock');
        return res.status(417).send("Admin has no stock");
    } else {
        const query = client.query('UPDATE stock SET amount = $1 ' +
            'WHERE user_id = $2 AND drink_name = $3', [amount, userId, drinkName]);
        return res.status(200);
    }
};


exports.getSales = (req, res) => {

};