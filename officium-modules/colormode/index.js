module.exports.ColorMode = function(mode) {
    switch (mode) {
        case 'light':
            $('.view').addClass('light')
                .removeClass('dark');
            $('.btn').addClass('btn-dark')
                .removeClass('btn-light');
            $('.navbar').addClass('navbar-light')
                .removeClass('navbar-dark');
            break;
        case 'dark':
            $('.view').addClass('dark')
                .removeClass('light');
            $('.btn').addClass('btn-light')
                .removeClass('btn-dark');
            $('.navbar').addClass('navbar-dark')
                .removeClass('navbar-light');
            break;
        case 'auto':
            watch((m) => {
                switch (m) {
                    case 'light':
                        $('.view').addClass('light')
                            .removeClass('dark');
                        $('.btn').addClass('btn-dark')
                            .removeClass('btn-light');
                        $('.navbar').addClass('navbar-light')
                            .removeClass('navbar-dark');
                        break;
                    case 'dark':
                        $('.view').addClass('dark')
                            .removeClass('light');
                        $('.btn').addClass('btn-light')
                            .removeClass('btn-dark');
                        $('.navbar').addClass('navbar-dark')
                            .removeClass('navbar-light');
                        break;
                }
            });
            break;
    }
}

module.exports.GetColor = function() {
    watch((e) => {
        return e;
    });
}

function watch(execute) {
    let hour = new Date().getHours();
    execute((6 <= hour && hour < 18) ? 'light' : 'dark');
}