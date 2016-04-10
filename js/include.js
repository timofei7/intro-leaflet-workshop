var PersonIcon = L.Icon.extend({
    options: {
        iconSize: [
            60, 60
        ],
        className: 'circular'
    }
});

function getGravatar(email) {
    return 'http://www.gravatar.com/avatar/' + md5(email) + '?s=200';
}
