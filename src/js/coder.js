const DEV = 1;

let bar_options = {
    axisX: { onlyInteger: true },
    axisY: { offset: 100, showGrid: false },
    horizontalBars: true,
    reverseData: true
};

let github_user = null;
if (document.location.hash) {
    github_user = document.location.hash.replace('#', '');
} else {
    document.location.href = '/';
}
// Set these values here because they are outside of vue's scope.
document.title = `CoderStats(${github_user})`;
document.getElementsByClassName('brand')[0].textContent = document.title;

let url_user = `https://api.github.com/users/${github_user}`,
    url_repos = `${url_user}/repos?sort=pushed&per_page=100`,
    months_short = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

if (DEV) {
    url_user = '/data/user.json';
    url_repos = '/data/repos.json';
}

let coder = new Vue({
    el: '#coder',
    data: {
        repos: [],
        response: {},
        sort_orders: {},
        sort_key: '',
        user: null
    },
    computed: {
        // Only repos the user actually pushed at, i.e. no forks with no user commits.
        repos_pushed: function() {
            return this.repos.filter(d => d.pushed_at > d.created_at);
        },
        repos_pushed_ratio: function() {
            return this.repos.length ? this.repos_pushed.length / this.repos.length : 0;
        },
        languages: function() {
            return d3.nest()
                .key(d => d.language)
                .rollup(leaves => leaves.length)
                .entries(this.repos_pushed.filter(d => d.language))
                .sort((a, b) => b.value - a.value);
        },
        issues: function() {
            return this.repoRanking('open_issues_count');
        },
        forks: function() {
            return this.repoRanking('forks_count');
        },
        stars: function() {
            return this.repoRanking('stargazers_count');
        },
        total_forks: function() {
            return d3.sum(this.forks, d => d.forks_count);
        },
        total_issues: function() {
            return d3.sum(this.issues, d => d.open_issues_count);
        },
        total_stars: function() {
            return d3.sum(this.stars, d => d.stargazers_count);
        }
    },
    filters: {
        fixURL: value => {
            if (!value.startsWith('http')) {
                value = `http://${value}`;
            }
            return value;
        },
        formatDate: value => {
            let dt = new Date(value);
            return `${dt.getDate()} ${months_short[dt.getMonth()]} ${dt.getYear() + 1900}`;
        },
        formatURL: value => {
            return value.split('://').pop().replace(/\/$/, '');
        }
    },
    created: function() {
        this.fetchRepos();
        this.fetchUser();
    },
    updated: function() {
        let language_ranking = this.languages.slice(0, 10);
        new Chartist.Bar('#language-ranking', {
            labels: language_ranking.map(d => d.key),
            series: [language_ranking.map(d => d.value)]
        }, bar_options);

        this.rankingGraph(this.issues.slice(0, 10), 'open_issues_count', '#issues-ranking');
        this.rankingGraph(this.forks.slice(0, 10), 'forks_count', '#forks-ranking');
        this.rankingGraph(this.stars.slice(0, 10), 'stargazers_count', '#stars-ranking');
    },
    methods: {
        fetchRepos: function() {
            this.$http.get(url_repos).then(response => {
                this.response.repos = response;
                this.repos = response.body;
            });
        },
        fetchUser: function() {
            this.$http.get(url_user).then(response => {
                this.response.user = response;
                this.user = response.body;
                if (!this.user.name) this.user.name = this.user.login;
            });
        },
        order: function(key) {
            // asc is default, because sort orders are initially unset
            return this.sort_orders[key] < 0 ? 'dsc' : 'asc';
        },
        rankingGraph: function(series, property, selector) {
            if (series.length) {
                new Chartist.Bar(selector, {
                    labels: series.map(d => d.name),
                    series: [series.map(d => d[property])]
                }, bar_options);
            }
        },
        repoRanking: function(property) {
            return this.repos_pushed.filter(d => d[property])
                .sort((a, b) => b[property] - a[property]);
        },
        sortBy: function(key, type='number') {
            let default_value = type === 'string' ? '' : 0;
            this.sort_key = key;
            this.sort_orders[key] = (this.sort_orders[key] || 1) * -1;
            this.repos.sort((a, b) => {
                let x = a[key] || default_value,
                    y = b[key] || default_value;
                if (type === 'string') {
                    x = x.toLowerCase();
                    y = y.toLowerCase();
                }
                return (x === y ? 0 : x > y ? 1 : -1) * this.sort_orders[key];
            });
        }
    }
});