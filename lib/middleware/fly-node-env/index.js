module.exports = function () {
    var env = process.env,
        node_env = env.NODE_ENV;

    if(!node_env && process.platform === 'win32') {
        process.argv.forEach(function(val) {
            var kv = val.split('=');
            if (kv.length > 1 && kv[0] === 'NODE_ENV') {
                node_env === kv[1].replace(/'/g, '');
            }
        })
    }

    if(!node_env || node_env === 'prod'|| node_env === 'production'){
        return 'prod'
    }
    if(/^qa/.test(node_env)){
        return 'qa'
    }
    if(/^yz/.test(node_env)){
        return 'yz'
    }
    if(/^dev/.test(node_env)){
        return 'dev'
    }
    throw new Error(`NODE_ENV is not correct, the value should be 'dev','qa','yz','prod',''`)
}