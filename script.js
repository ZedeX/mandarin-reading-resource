        // 存储所有音频数据
        let audioData = [];
        // 存储过滤后的数据
        let filteredData = [];
        // 当前页码
        let currentPage = 1;
        // 每页显示的项目数
        const itemsPerPage = 15;
        // 是否正在加载数据
        let isLoading = false;
        // 当前播放的音频元素
        let currentlyPlaying = null;
        // 当前播放的按钮
        let currentPlayButton = null;
        // 当前焦点播放器（用于键盘控制）
        let focusedPlayer = null;
        // 播放状态存储键名前缀
        const PLAYBACK_STORAGE_KEY = 'audio_playback_status_';
        // 用户状态存储键名
        const USER_STATE_KEY = 'user_state';

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 尝试多种方式加载数据
            loadAudioData();
        });

        // 从多种来源加载JSON数据
        function loadAudioData() {
            // 首先尝试通过fetch加载（服务器方式）
            fetch('list.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    handleDataLoadSuccess(data);
                    // 恢复用户状态
                    restoreUserState();
                })
                .catch(error => {
                    console.error('通过服务器加载数据时出错:', error);
                    // 如果fetch失败，尝试通过XMLHttpRequest加载
                    loadViaXMLHttpRequest();
                });
        }

        // 通过XMLHttpRequest加载数据
        function loadViaXMLHttpRequest() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'list.json', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            handleDataLoadSuccess(data);
                            // 恢复用户状态
                            restoreUserState();
                        } catch (e) {
                            console.error('解析JSON数据时出错:', e);
                            showFileUploadSection();
                        }
                    } else {
                        console.error('通过XMLHttpRequest加载数据失败，状态码:', xhr.status);
                        showFileUploadSection();
                    }
                }
            };
            xhr.onerror = function() {
                console.error('通过XMLHttpRequest加载数据时发生网络错误');
                showFileUploadSection();
            };
            xhr.send();
        }

        // 处理数据加载成功
        function handleDataLoadSuccess(data) {
            // 验证数据格式
            if (!Array.isArray(data)) {
                throw new Error('数据格式不正确，应为数组');
            }
            
            audioData = data;
            
            // 更新统计信息
            document.getElementById('total-count').textContent = audioData.length;
            
            // 填充年级筛选选项
            populateGradeFilter();
            
            // 显示所有音频
            filteredData = [...audioData];
            renderPage(currentPage);
            
            // 绑定筛选事件
            bindFilterEvents();
            
            // 隐藏文件上传区域
            document.getElementById('fileUploadSection').style.display = 'none';
        }

        // 显示文件上传区域
        function showFileUploadSection() {
            document.getElementById('fileUploadSection').style.display = 'block';
        }

        // 从本地文件加载JSON数据
        function loadLocalJson() {
            const fileInput = document.getElementById('jsonFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('请选择一个JSON文件');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    handleDataLoadSuccess(data);
                    // 恢复用户状态
                    restoreUserState();
                    // 隐藏文件上传区域
                    document.getElementById('fileUploadSection').style.display = 'none';
                } catch (e) {
                    console.error('解析JSON文件时出错:', e);
                    alert('解析JSON文件时出错，请检查文件格式');
                }
            };
            reader.onerror = function() {
                console.error('读取文件时出错');
                alert('读取文件时出错');
            };
            reader.readAsText(file, 'utf-8');
        }

        // 填充年级筛选选项
        function populateGradeFilter() {
            const gradeFilter = document.getElementById('grade-filter');
            // 清空现有选项
            gradeFilter.innerHTML = '<option value="">全部年级</option>';
            
            // 确保数据中有年级字段
            if (audioData.length > 0 && audioData[0].年级) {
                const grades = [...new Set(audioData.map(item => item.年级))].sort();
                
                grades.forEach(grade => {
                    const option = document.createElement('option');
                    option.value = grade;
                    option.textContent = `${grade}年级`;
                    gradeFilter.appendChild(option);
                });
            }
        }

        // 绑定筛选事件
        function bindFilterEvents() {
            document.getElementById('grade-filter').addEventListener('change', handleFilterChange);
            document.getElementById('term-filter').addEventListener('change', handleFilterChange);
            document.getElementById('search-input').addEventListener('input', debounce(handleFilterChange, 300));
        }

        // 防抖函数，避免频繁触发筛选
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // 处理筛选变化
        function handleFilterChange() {
            currentPage = 1;
            filterAudio();
            // 保存用户状态
            saveUserState();
        }

        // 筛选音频
        function filterAudio() {
            const gradeFilter = document.getElementById('grade-filter').value;
            const termFilter = document.getElementById('term-filter').value;
            const searchInput = document.getElementById('search-input').value.toLowerCase();
            
            // 确保数据存在
            if (!audioData || audioData.length === 0) {
                filteredData = [];
                renderPage(currentPage);
                return;
            }
            
            filteredData = audioData.filter(item => {
                // 检查对象是否有必要的属性
                if (!item.年级 || !item.学期 || !item.课文标题) {
                    return false;
                }
                
                // 年级筛选
                if (gradeFilter && item.年级 !== gradeFilter) {
                    return false;
                }
                
                // 学期筛选
                if (termFilter && item.学期 !== termFilter) {
                    return false;
                }
                
                // 搜索筛选
                if (searchInput && !item.课文标题.toLowerCase().includes(searchInput)) {
                    return false;
                }
                
                return true;
            });
            
            renderPage(currentPage);
        }

        // 渲染指定页面
        function renderPage(page) {
            if (isLoading) return;
            
            const container = document.getElementById('audio-container');
            const pagination = document.getElementById('pagination');
            
            // 显示加载中状态
            container.innerHTML = '<div class="loading">加载中...</div>';
            
            // 如果没有数据
            if (!filteredData || filteredData.length === 0) {
                container.innerHTML = '<div class="no-results">未找到匹配的课文朗读资源</div>';
                pagination.innerHTML = '';
                return;
            }
            
            // 计算分页数据
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
            const pageData = filteredData.slice(startIndex, endIndex);
            
            // 模拟异步加载，避免阻塞UI
            setTimeout(() => {
                if (pageData.length === 0) {
                    container.innerHTML = '<div class="no-results">未找到匹配的课文朗读资源</div>';
                } else {
                    container.innerHTML = pageData.map((item, index) => {
                        // 确保必要字段存在
                        const src = item.src || '';
                        const grade = item.年级 || '';
                        const term = item.学期 || '';
                        const lessonNumber = item.课文序号 || '';
                        const title = item.课文标题 || '';
                        // 为每个播放器生成唯一ID
                        const playerId = `player-${(page - 1) * itemsPerPage + index}`;
                        const buttonId = `btn-${(page - 1) * itemsPerPage + index}`;
                        const progressId = `progress-${(page - 1) * itemsPerPage + index}`;
                        const timeId = `time-${(page - 1) * itemsPerPage + index}`;
                        const playbackInfoId = `playback-info-${(page - 1) * itemsPerPage + index}`;
                        
                        // 获取播放状态信息
                        const playbackStatus = getPlaybackStatus(src);
                        let playbackInfoText = '';
                        if (playbackStatus) {
                            if (playbackStatus.completed) {
                                playbackInfoText = `已完成播放${playbackStatus.playCount}次，上次播放到${formatTime(playbackStatus.currentTime)}`;
                            } else {
                                playbackInfoText = `上次播放到${formatTime(playbackStatus.currentTime)}，已播放${Math.round((playbackStatus.currentTime / playbackStatus.duration) * 100)}%`;
                            }
                        }
                        
                        return `
                        <div class="audio-card">
                            <div class="card-header">
                                <div class="card-title">${title}</div>
                            </div>
                            <div class="card-body">
                                <div class="card-info">
                                    <span class="grade">${grade}年级</span>
                                    <span class="term">第${term}学期</span>
                                </div>
                                <div class="card-info">
                                    <span>${lessonNumber}</span>
                                </div>
                                <div class="custom-audio-player">
                                    <button id="${buttonId}" class="play-btn">▶</button>
                                    <div id="${progressId}" class="progress-container">
                                        <div class="progress-bar"></div>
                                    </div>
                                    <div id="${timeId}" class="time-display">00:00 / 00:00</div>
                                    <audio id="${playerId}" class="audio-player" preload="none">
                                        <source src="${src}" type="audio/ogg">
                                        您的浏览器不支持音频播放。
                                    </audio>
                                </div>
                                <div id="${playbackInfoId}" class="playback-info ${playbackStatus && playbackStatus.completed ? 'completed' : ''}">
                                    ${playbackInfoText}
                                </div>
                            </div>
                        </div>
                    `}).join('');
                    
                    // 初始化所有播放器
                    initializePlayers();
                }
                
                // 渲染分页控件
                renderPagination(page, totalPages);
                
                // 保存用户状态
                saveUserState();
            }, 0);
        }

        // 初始化播放器
        function initializePlayers() {
            const players = document.querySelectorAll('.audio-player');
            players.forEach((player, index) => {
                const playerId = player.id;
                const buttonId = playerId.replace('player-', 'btn-');
                const progressId = playerId.replace('player-', 'progress-');
                const timeId = playerId.replace('player-', 'time-');
                const playbackInfoId = playerId.replace('player-', 'playback-info-');
                
                const playButton = document.getElementById(buttonId);
                const progressBar = document.getElementById(progressId).querySelector('.progress-bar');
                const progressContainer = document.getElementById(progressId);
                const timeDisplay = document.getElementById(timeId);
                const playbackInfo = document.getElementById(playbackInfoId);
                
                // 获取音频源路径
                const audioSrc = filteredData[(currentPage - 1) * itemsPerPage + index].src || '';
                
                // 标记是否已加载音频源
                let isSourceLoaded = false;
                
                // 监听播放按钮点击
                playButton.addEventListener('click', function() {
                    // 如果尚未加载音频源，则加载
                    if (!isSourceLoaded) {
                        const source = document.createElement('source');
                        source.src = audioSrc;
                        source.type = 'audio/ogg';
                        player.appendChild(source);
                        isSourceLoaded = true;
                    }
                    
                    togglePlay(player, playButton, playbackInfo);
                });
                
                // 监听播放进度
                player.addEventListener('timeupdate', function() {
                    updateProgress(player, progressBar, timeDisplay);
                    // 每隔5秒保存一次播放状态
                    if (Math.floor(player.currentTime) % 5 === 0) {
                        savePlaybackStatus(player);
                    }
                });
                
                // 监听进度条点击
                progressContainer.addEventListener('click', function(e) {
                    // 如果尚未加载音频源，则加载
                    if (!isSourceLoaded) {
                        const source = document.createElement('source');
                        source.src = audioSrc;
                        source.type = 'audio/ogg';
                        player.appendChild(source);
                        isSourceLoaded = true;
                    }
                    
                    setProgress(player, progressContainer, e);
                });
                
                // 监听播放完成
                player.addEventListener('ended', function() {
                    playButton.textContent = '▶';
                    playButton.style.background = '#74b9ff';
                    if (currentlyPlaying === player) {
                        currentlyPlaying = null;
                        currentPlayButton = null;
                        focusedPlayer = null;
                    }
                    // 保存播放完成状态
                    savePlaybackStatus(player, true);
                    // 更新播放信息显示
                    updatePlaybackInfo(playbackInfo, player);
                });
                
                // 监听加载元数据
                player.addEventListener('loadedmetadata', function() {
                    updateTimeDisplay(player, timeDisplay);
                    // 更新播放信息显示
                    updatePlaybackInfo(playbackInfo, player);
                });
                
                // 监听播放开始
                player.addEventListener('play', function() {
                    // 确保在播放开始时更新时间显示
                    updateTimeDisplay(player, timeDisplay);
                    updatePlaybackInfo(playbackInfo, player);
                });
                
                // 监听暂停
                player.addEventListener('pause', function() {
                    updateTimeDisplay(player, timeDisplay);
                    savePlaybackStatus(player);
                    updatePlaybackInfo(playbackInfo, player);
                });
                
                // 监听播放错误
                player.addEventListener('error', function(e) {
                    console.error('音频播放出错:', e);
                    updateTimeDisplay(player, timeDisplay);
                    // 显示错误信息
                    if (timeDisplay) {
                        timeDisplay.textContent = '00:00 / 00:00';
                    }
                });
                
                // 获取播放状态
                const playbackStatus = getPlaybackStatus(audioSrc);
                
                // 如果有保存的播放位置，设置到该位置
                if (playbackStatus && playbackStatus.currentTime > 0) {
                    // 只有在元数据加载完成后才设置播放位置
                    player.addEventListener('loadedmetadata', function() {
                        player.currentTime = playbackStatus.currentTime || 0;
                        updateTimeDisplay(player, timeDisplay);
                    });
                } else {
                    // 立即更新时间显示
                    updateTimeDisplay(player, timeDisplay);
                }
                
                // 初始化播放器对象
                player.player = {
                    player: player,
                    button: playButton,
                    playbackInfo: playbackInfo
                };
            });
        }

        // 切换播放状态
        function togglePlay(player, playButton, playbackInfo) {
            // 如果点击的是当前正在播放的音频，则暂停
            if (currentlyPlaying === player && !player.paused) {
                player.pause();
                playButton.textContent = '▶';
                playButton.style.background = '#74b9ff';
                currentlyPlaying = null;
                currentPlayButton = null;
                if (focusedPlayer && focusedPlayer.player === player) {
                    focusedPlayer = null;
                }
                // 保存播放状态
                savePlaybackStatus(player);
                // 更新播放信息显示
                updatePlaybackInfo(playbackInfo, player);
                return;
            }
            
            // 如果有其他音频正在播放，先暂停它
            if (currentlyPlaying) {
                currentlyPlaying.pause();
                if (currentPlayButton) {
                    currentPlayButton.textContent = '▶';
                    currentPlayButton.style.background = '#74b9ff';
                }
                // 保存之前播放的音频状态
                savePlaybackStatus(currentlyPlaying);
                updatePlaybackInfo(currentlyPlaying.player.playbackInfo, currentlyPlaying);
            }
            
            // 播放当前音频
            player.play().catch(e => {
                console.error('播放失败:', e);
                alert('音频播放失败，请稍后重试');
            });
            playButton.textContent = '❚❚';
            playButton.style.background = '#0984e3';
            
            // 更新当前播放的音频和按钮
            currentlyPlaying = player;
            currentPlayButton = playButton;
            focusedPlayer = {
                player: player,
                button: playButton
            };
            
            // 更新播放信息显示
            updatePlaybackInfo(playbackInfo, player);
        }

        // 更新进度条
        function updateProgress(player, progressBar, timeDisplay) {
            updateTimeDisplay(player, timeDisplay);
            
            // 确保在有效的数值下更新进度条
            if (player.duration && isFinite(player.duration) && player.duration > 0) {
                const percent = (player.currentTime / player.duration) * 100;
                // 限制百分比在0-100之间
                const clampedPercent = Math.min(100, Math.max(0, percent));
                progressBar.style.width = `${clampedPercent}%`;
            } else {
                // 如果时长无效，重置进度条
                progressBar.style.width = '0%';
            }
        }

        // 更新时间显示
        function updateTimeDisplay(player, timeDisplay) {
            const current = formatTime(player.currentTime);
            // 确保在音频元数据加载完成后再获取时长
            let duration = '00:00';
            if (player.duration && isFinite(player.duration)) {
                duration = formatTime(player.duration);
            }
            timeDisplay.textContent = `${current} / ${duration}`;
        }

        // 格式化时间
        function formatTime(seconds) {
            // 处理无效的时间值
            if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
                return '00:00';
            }
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }

        // 设置进度
        function setProgress(player, progressContainer, e) {
            // 如果没有音频源，则不执行操作
            if (!player.querySelector('source')) {
                return;
            }
            
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = player.duration;
            
            player.currentTime = (clickX / width) * duration;
            // 保存播放状态
            savePlaybackStatus(player);
        }

        // 保存播放状态到localStorage
        function savePlaybackStatus(player, isCompleted = false) {
            try {
                // 获取音频源路径
                let src = '';
                if (player.querySelector('source')) {
                    src = player.querySelector('source').src;
                } else {
                    // 如果source元素不存在，从filteredData中获取
                    const playerId = player.id;
                    const playerIndex = parseInt(playerId.replace('player-', ''));
                    const dataIndex = (currentPage - 1) * itemsPerPage + playerIndex;
                    if (filteredData[dataIndex] && filteredData[dataIndex].src) {
                        src = filteredData[dataIndex].src;
                    }
                }
                
                const currentTime = player.currentTime;
                const duration = player.duration || 0;
                
                // 获取现有的播放状态
                let playbackStatus = getPlaybackStatus(src) || {
                    playCount: 0,
                    completed: false,
                    currentTime: 0,
                    duration: duration
                };
                
                // 更新播放状态
                playbackStatus.currentTime = currentTime;
                playbackStatus.duration = duration;
                
                // 如果标记为完成，增加播放次数
                if (isCompleted) {
                    playbackStatus.playCount = (playbackStatus.playCount || 0) + 1;
                    playbackStatus.completed = true;
                }
                
                // 保存到localStorage
                localStorage.setItem(PLAYBACK_STORAGE_KEY + src, JSON.stringify(playbackStatus));
            } catch (e) {
                console.error('保存播放状态失败:', e);
            }
        }

        // 获取播放状态
        function getPlaybackStatus(src) {
            try {
                const stored = localStorage.getItem(PLAYBACK_STORAGE_KEY + src);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                console.error('获取播放状态失败:', e);
                return null;
            }
        }

        // 更新播放信息显示
        function updatePlaybackInfo(playbackInfoElement, player) {
            if (!playbackInfoElement) return;
            
            // 获取音频源路径
            let src = '';
            if (player.querySelector('source')) {
                src = player.querySelector('source').src;
            } else {
                // 如果source元素不存在，从filteredData中获取
                const playerId = player.id;
                const playerIndex = parseInt(playerId.replace('player-', ''));
                const dataIndex = (currentPage - 1) * itemsPerPage + playerIndex;
                if (filteredData[dataIndex] && filteredData[dataIndex].src) {
                    src = filteredData[dataIndex].src;
                }
            }
            
            const playbackStatus = getPlaybackStatus(src);
            
            if (playbackStatus) {
                // 确保时间值有效
                const currentTime = playbackStatus.currentTime || 0;
                const duration = playbackStatus.duration || player.duration || 0;
                
                if (playbackStatus.completed) {
                    playbackInfoElement.textContent = `已完成播放${playbackStatus.playCount}次，上次播放到${formatTime(currentTime)}`;
                    playbackInfoElement.className = 'playback-info completed';
                } else {
                    // 确保计算百分比时不会出现除零错误
                    const percent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
                    playbackInfoElement.textContent = `上次播放到${formatTime(currentTime)}，已播放${percent}%`;
                    playbackInfoElement.className = 'playback-info';
                }
            } else {
                playbackInfoElement.textContent = '';
                playbackInfoElement.className = 'playback-info';
            }
        }

        // 渲染分页控件
        function renderPagination(currentPage, totalPages) {
            const pagination = document.getElementById('pagination');
            
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }
            
            let paginationHTML = '';
            
            // 上一页按钮
            paginationHTML += `
                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    上一页
                </button>
            `;
            
            // 页码
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            if (startPage > 1) {
                paginationHTML += `<button onclick="changePage(1)">1</button>`;
                if (startPage > 2) {
                    paginationHTML += `<span>...</span>`;
                }
            }
            
            for (let i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button onclick="changePage(${i})" disabled style="background-color: #0984e3;">${i}</button>`;
                } else {
                    paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
                }
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    paginationHTML += `<span>...</span>`;
                }
                paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
            }
            
            // 下一页按钮
            paginationHTML += `
                <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    下一页
                </button>
            `;
            
            // 当前页信息
            paginationHTML += `<span>第 ${currentPage} 页，共 ${totalPages} 页</span>`;
            
            pagination.innerHTML = paginationHTML;
            
            // 保存用户状态
            saveUserState();
        }

        // 切换页面
        function changePage(page) {
            // 确保页码在有效范围内
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);
            if (page < 1 || page > totalPages || page === currentPage) {
                return;
            }
            
            currentPage = page;
            renderPage(currentPage);
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // 保存用户状态
            saveUserState();
        }
            // 保存用户状态到localStorage
            function saveUserState() {
                const state = {
                    gradeFilter: document.getElementById('grade-filter').value,
                    termFilter: document.getElementById('term-filter').value,
                    searchInput: document.getElementById('search-input').value,
                    currentPage: currentPage
                };
                
                try {
                    localStorage.setItem(USER_STATE_KEY, JSON.stringify(state));
                } catch (e) {
                    console.error('保存用户状态失败:', e);
                }
            }
        
            // 从localStorage恢复用户状态
            function restoreUserState() {
                try {
                    const savedState = localStorage.getItem(USER_STATE_KEY);
                    if (savedState) {
                        const state = JSON.parse(savedState);
                        
                        // 恢复筛选条件
                        if (state.gradeFilter) {
                            document.getElementById('grade-filter').value = state.gradeFilter;
                        }
                        
                        if (state.termFilter) {
                            document.getElementById('term-filter').value = state.termFilter;
                        }
                        
                        // 恢复搜索关键词
                        if (state.searchInput) {
                            document.getElementById('search-input').value = state.searchInput;
                        }
                        
                        // 恢复当前页码
                        if (state.currentPage) {
                            currentPage = state.currentPage;
                        }
                        
                        // 应用保存的状态
                        filterAudio();
                    } else {
                        // 如果没有保存的状态，则显示第一页
                        renderPage(currentPage);
                    }
                } catch (e) {
                    console.error('恢复用户状态失败:', e);
                    // 出错时显示第一页
                    renderPage(currentPage);
                }
            }
