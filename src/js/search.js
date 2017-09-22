let search = new Vue({
    el: '#search',
    data: {
        username: ''
    },
    methods: {
        coder: function() {
            if (this.username) {
                document.location.href = `/github#${this.username}`;
            }
        }
    }
});
