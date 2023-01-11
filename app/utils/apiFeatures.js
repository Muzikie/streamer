class APIFeatures {
    constructor(
      query /* passing mongoose query*/,
      queryString /* query string from express */
    ) {
      this.query = query;
      this.queryString = queryString;
    }
    filter() {
      //1 A) Filtering
      const queryObj = { ...this.queryString };
      const excludedFields = ['sort', 'limit', 'page', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);
  
      //2 B) advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // g: all occurances   , \b has space around that
  
     //gte, gt, lte, lt
      this.query.find(JSON.parse(queryStr));
      return this;
    }
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' '); //-price -ratingsAverage
        this.query = this.query.sort(sortBy); // {sort : 'price'}
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields); //including
      } else {
        this.query = this.query.select('-__v'); //excluding
      }
      return this;
    }
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
  }
  
  module.exports = APIFeatures;
  