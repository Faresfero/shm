 // Developer note: this script handles rendering, filtering and searching of mods.
    document.addEventListener('DOMContentLoaded', () => {
        // URL to a GitHub raw JSON file with user data. Replace with your raw URL or leave empty to use the local fallback.
        const USER_DB_URL = "https://cdn.jsdelivr.net/gh/Faresfero/shm@refs/heads/main/database.json"; // e.g. https://raw.githubusercontent.com/<user>/<repo>/main/users.json

        // Fallback local user DB. Structure: { id, name, type, isVerified }
        
        const fallbackUsers = [
            { id: 1, name: 'OLEPICYT', type: 1, isVerified: true },
            { id: 2, name: 'this could be you🤯🤯', type: 0, isVerified: false },
            { id: 3, name: 'SHL Publisher', type: 4, isVerified: false },
        ];

        // Servers reference users by numeric id in `invite`.
        const servers = [
            {
                name: "Smash hit NULL",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2pg8ZlEDXd04EP_8_Mx6DYeDy-Bn7h6-LEXIlGb9TN4CpRpVAux-wBZiz01dQGsS9qVc&usqp=CAU",
                invite: 1,
                link: "https://sites.google.com/view/shmodsx/mods/0002",
                type: ["sh"]
            },
            {
                name: "Smash hit Future",
                image: "https://i.ytimg.com/vi/cgypxTgTySE/maxresdefault.jpg",
                invite: 1,
                link: "https://sites.google.com/view/shmodsx/mods/0001",
                type: ["sh"]
            },
            {
                name: "Ultra Smash Hit Warlock 2",
                image: "https://i.ytimg.com/vi/cgypxTgTySE/maxresdefault.jpg",
                invite: 7,
                link: "https://sites.google.com/view/shmodsx/mods/0003",
                type: ["sh"]
            },
             {
                name: "A mod from SHL Publisher",
                image: "https://placeholder.com/200x100",
                invite: 3,
                link: "https://sites.google.com/view/shmodsx/mods/404",
                type: ["shl"]
            },
            {
                name: "Submit your mod here!",
                image: "https://via.placeholder.com/200x100",
                invite: 2,
                link: "https://sites.google.com/view/shmodsx/submit",
                type: ["sh","shl"]
            }
        ];

        // CSS for role badges
        const style = document.createElement('style');
        style.textContent = `
            .user-badge { display:inline-block; margin-left:6px; padding:2px 6px; border-radius:6px; font-size:12px; vertical-align:middle; }
            .role-owner { background:#bfefff; color:#012; }
            .role-supervisor { background:#8a2be2; color:white; }
            .role-staff { background:#ff9800; color:black; }
            .role-member { background:#b9bbbe; color:#012; }
            .role-SHL { background:#FF000 ; color:blue; }
            .username { font-weight:600; margin-right:6px; }
            .user-row { display:flex; align-items:center; gap:8px; }
        `;
        document.head.appendChild(style);

        const serverList = document.getElementById('server-list');
        const searchInput = document.getElementById('search-input');
        const noResults = document.getElementById('no-results');
        let activeCategory = 'all';
        let usersMap = {};

        function roleClass(type) {
            switch (type) {
                case 1: return 'role-owner';
                case 2: return 'role-supervisor';
                case 3: return 'role-staff';
                case 4: return 'role-SHL';
                default: return 'role-member';
            }
        }

        function roleLabel(type) {
            switch (type) {
                case 1: return 'Owner Of SHM';
                case 2: return 'Supervisor';
                case 3: return 'Staff';
                case 4: return 'SHL Publisher';
                default: return 'Publisher';
            }
        }

        function renderUserInfo(userId) {
            const u = usersMap[userId];
            if (!u) return '<span class="server-invite">Unknown</span>';
            const checked = u.isVerified ? ' ✓' : '';
            const badge = `<span class="user-badge ${roleClass(u.type)}">${roleLabel(u.type)}</span>`;
            return `
                <div class="user-row">
                    <span class="username">${u.name}${u.isVerified ? ' ✓' : ''}</span>
                    ${badge}
                </div>
            `;
        }

        function generateServers(list = []) {
            serverList.innerHTML = '';
            if (!list.length) return;
            list.forEach(server => {
                const card = document.createElement('div');
                card.className = 'server-card';
                const userInfoHTML = renderUserInfo(server.invite);
                card.innerHTML = `
                    <img src="${server.image}" alt="${server.name}" loading="lazy" width="220" height="120">
                    <div class="server-info">
                        <a href="${server.link}" target="_blank" rel="noopener noreferrer" class="server-name">${server.name}</a>
                        <div class="server-invite">${userInfoHTML}</div>
                        <a href="${server.link}" target="_blank" rel="noopener noreferrer" class="join-btn">Install!</a>
                    </div>
                `;
                serverList.appendChild(card);
            });
        }

        function debounce(fn, wait = 200) {
            let t;
            return (...args) => {
                clearTimeout(t);
                t = setTimeout(() => fn(...args), wait);
            };
        }

        function performSearch() {
            const q = (searchInput.value || '').trim().toLowerCase();
            let filtered = servers.filter(s => {
                const name = s.name ? s.name.toLowerCase() : '';
                const user = usersMap[s.invite];
                const username = user && user.name ? user.name.toLowerCase() : '';
                const inviteType = Array.isArray(s.type) ? s.type.join(' ') : '';
                return (!q || name.includes(q) || username.includes(q) || inviteType.includes(q));
            });
            if (activeCategory !== 'all') {
                filtered = filtered.filter(s => Array.isArray(s.type) && s.type.includes(activeCategory));
            }
            serverList.innerHTML = '';
            if (!filtered.length) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
                generateServers(filtered);
            }
        }

        const debouncedSearch = debounce(performSearch, 180);

        // Attach search listener
        searchInput.addEventListener('input', debouncedSearch);

        // Attach filter button listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.category || 'all';
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                performSearch();
            });
        });

        // Load user DB from GitHub raw or fallback
        async function loadUsers() {
            try {
                if (USER_DB_URL) {
                    const res = await fetch(USER_DB_URL);
                    if (!res.ok) throw new Error('Network response not ok');
                    const list = await res.json();
                    list.forEach(u => usersMap[u.id] = u);
                    return;
                }
            } catch (e) {
                console.warn('Failed to load user DB from GitHub, using fallback', e);
            }
            // fallback
            fallbackUsers.forEach(u => usersMap[u.id] = u);
        }

        // Initialize
        loadUsers().then(() => {
            generateServers(servers);
        });
    });
