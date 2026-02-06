class APIFeatures {
    constructor(query, queryString) {
        //query = Tour.find()
        //queryString = req.query
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //FILTERING

        //as filtering obj can have 'page' or 'sort', we can't use .find() method
        //shalow copy of req.query
        let queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //ADVANCE FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        //this will replace the gte, gt, lte, lt with $gte, $gt, $lte, $lt

        queryObj = JSON.parse(queryStr);
        this.query.find(queryObj);
        return this; //return the entire obj so that we can chain methods
    }
    sort() {
        if (this.queryString.sort && this.queryString.sort.trim() !== '') {
            //sort('price ratingAverage') //so we need to split this
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this
    }

}
module.exports = APIFeatures