const model = require('../models/model');

//  post: http://localhost:8080/api/categories
async function create_Categories(req, res) {
    const Create = new model.Categories({
        type: "Savings",
        color: "#1F3B5C"
    });

    try {
        await Create.save();
        return res.json(Create);
    } catch (err) {
        return res.status(400).json({ message: `Error while creating categories: ${err}` });
    }
}

//  get: http://localhost:8080/api/categories
async function get_Categories(req, res) {
    try {
        let data = await model.Categories.find({});
        let filter = data.map(v => ({ type: v.type, color: v.color }));
        return res.json(filter);
    } catch (err) {
        return res.status(500).json({ message: `Error fetching categories: ${err}` });
    }
}

//  post: http://localhost:8080/api/transaction
async function create_Transaction(req, res) {
    if (!req.body) return res.status(400).json("Post HTTP Data not Provided");
    let { name, type, amount } = req.body;

    const create = new model.Transaction({
        name,
        type,
        amount,
        date: new Date()
    });

    try {
        await create.save();
        return res.json(create);
    } catch (err) {
        return res.status(400).json({ message: `Error while creating transaction: ${err}` });
    }
}

//  get: http://localhost:8080/api/transaction
async function get_Transaction(req, res) {
    try {
        let data = await model.Transaction.find({});
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: `Error fetching transactions: ${err}` });
    }
}

//  delete: http://localhost:8080/api/transaction
async function delete_Transaction(req, res) {
    if (!req.body) return res.status(400).json({ message: "Request body not Found" });

    try {
        await model.Transaction.deleteOne(req.body).clone();
        return res.json("Record Deleted...!");
    } catch (err) {
        return res.status(400).json({ message: `Error while deleting transaction record: ${err}` });
    }
}

//  get: http://localhost:8080/api/labels
async function get_Labels(req, res) {
    try {
        let result = await model.Transaction.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: 'type',
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $unwind: "$categories_info"
            }
        ]);

        let data = result.map(v => ({
            _id: v._id,
            name: v.name,
            type: v.type,
            amount: v.amount,
            color: v.categories_info['color']
        }));

        res.json(data);
    } catch (error) {
        res.status(400).json("Lookup Collection Error");
    }
}

module.exports = {
    create_Categories,
    get_Categories,
    create_Transaction,
    get_Transaction,
    delete_Transaction,
    get_Labels
}