module.exports = function() {
    return function(err, req, res, next) {
        if(err.code == 'ER_DUP_ENTRY'){
            err = req.app.buildDupError(err);
        }
      next(err);
    };
  };