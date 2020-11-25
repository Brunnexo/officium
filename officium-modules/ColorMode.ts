function ColorMode(mode: 'light' | 'dark' | 'auto') {
    let color = (mode == 'light' || mode == 'dark') ? mode : () => {
        let h = new Date().getHours();
        return (6 <= h && h < 18) ? 'light' : 'dark'
    };
    switch (color) {
        case 'light':
            document.querySelector('.view')!.classList.add('light');
            document.querySelector('.view')!.classList.remove('dark');

            document.querySelectorAll('.btn').forEach((elmnt) => {
                elmnt.classList.add('btn-dark');
                elmnt.classList.remove('btn-light');
            });
            
            document.querySelectorAll('.navbar').forEach((elmnt) => {
                elmnt.classList.add('navbar-light');
                elmnt.classList.remove('navbar-dark');
            });
            break;
        case 'dark':
            document.querySelector('.view')!.classList.add('dark');
            document.querySelector('.view')!.classList.remove('light');

            document.querySelectorAll('.btn').forEach((elmnt) => {
                elmnt.classList.add('btn-light');
                elmnt.classList.remove('btn-dark');
            });

            document.querySelectorAll('.navbar').forEach((elmnt) => {
                elmnt.classList.add('navbar-dark');
                elmnt.classList.remove('navbar-light');
            });
            break;
    }
}

export { ColorMode };

