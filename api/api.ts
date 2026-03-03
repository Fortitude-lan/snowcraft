export const api: any = {
    loginOrRegister: '/verify-code/',  // 验证邮箱验证码并登录/注册
    requestCode: '/request-code/',     // 请求邮箱验证码
    adminlogin: '/login/',
    refreshToken: '/token/refresh/',
    testAuth: '/testAuth/',
    syncUser: '/sync-user/',
    saveAddr:'/save-address/',
    // products
    getProducts: '/product/list/',
    addProducts: '/product/add/',
    getAssetsList: '/product/assets/',
    updateProductStatus: '/product/update-status/',
    upload: '/product/upload/',
    addCustomDesign: '/product/add-design/',
    addProduct: '/product/add-product/',
    // shops order/cart
    orderList: '/shops/list/',
    addOrder: '/shops/add/',
    userOrders:'shops/user/',
    updateOrderStatus: '/shops/update-order-status/',
    addCart:'/shops/add-cart/',
    updcart:'/shops/updare-cart/',
    cartlist:'/shops/cart/',
    delcarts:'/shops/delcarts/',
    reviewList:'/reviews/list',
    proSelectList:'/reviews/products',
    addreview:'/reviews/add',
    reviewStats:'/reviews/score',
    // admin
    reviewSummary:'/reviews/summary',
    statsOverview: '/stats-overview',
    reviewBar:"/shops/month-sales"


};