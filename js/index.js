document.addEventListener('DOMContentLoaded', function () {
    // DOM 요소 가져오기
    const pdfCanvas = document.getElementById('pdfCanvas');
    const btnIntro = document.getElementById('btnIntro');
    const btnPoster = document.getElementById('btnPoster');
    const pdfViewer = document.querySelector('.pdf-viewer');
    const pdfDivider = document.getElementById('pdf-divider');
    
    // 위쪽 컨트롤
    const pdfControlsTop = document.getElementById('pdfControlsTop');
    const prevBtnTop = document.getElementById('prevBtnTop');
    const nextBtnTop = document.getElementById('nextBtnTop');
    const pageInfoTop = document.getElementById('pageInfoTop');
    
    // 아래쪽 컨트롤
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');

    let selected = null;
    let pdfDoc = null;
    let pageNum = 1;
    let canvas = pdfCanvas;
    let ctx = canvas.getContext('2d');

    // PDF.js 워커 설정
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // PDF 표시/숨김 함수
    function hidePdf() {
        pdfViewer.style.display = 'none';
        pdfViewer.classList.remove('active');
        pdfDivider.style.display = 'none';
    }

    function showPdf() {
        pdfViewer.style.display = 'flex';
        pdfViewer.classList.add('active');
        pdfDivider.style.display = 'block';
    }

    // PDF 페이지 렌더링
    function renderPage(num) {
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({scale: 1.5});
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            page.render(renderContext);
        });

        // 페이지 정보 업데이트 (위아래 모두)
        const pageText = `페이지 ${num} / ${pdfDoc.numPages}`;
        pageInfo.textContent = pageText;
        pageInfoTop.textContent = pageText;
        
        // 버튼 상태 업데이트 (위아래 모두)
        const isPrevDisabled = (num <= 1);
        const isNextDisabled = (num >= pdfDoc.numPages);
        
        prevBtn.disabled = isPrevDisabled;
        nextBtn.disabled = isNextDisabled;
        prevBtnTop.disabled = isPrevDisabled;
        nextBtnTop.disabled = isNextDisabled;
    }

    // PDF 로드 함수
    function loadPDF(url) {
        pdfjsLib.getDocument(url).promise.then(function(pdf) {
            pdfDoc = pdf;
            pageNum = 1;
            renderPage(pageNum);
        }).catch(function(error) {
            console.error('PDF 로드 오류:', error);
            // 오류 시 대체 방법 제공
            showFallbackMessage();
        });
    }

    // 대체 메시지 표시
    function showFallbackMessage() {
        ctx.fillStyle = '#374151';
        ctx.font = '20px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PDF를 로드할 수 없습니다.', canvas.width/2, canvas.height/2);
        ctx.fillText('직접 다운로드하여 확인해주세요.', canvas.width/2, canvas.height/2 + 30);
    }

    // 이전 페이지 함수
    function goToPrevPage() {
        if (pageNum <= 1) return;
        pageNum--;
        renderPage(pageNum);
    }

    // 다음 페이지 함수
    function goToNextPage() {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        renderPage(pageNum);
    }

    // 이전 페이지 버튼 이벤트 (아래쪽)
    prevBtn.addEventListener('click', goToPrevPage);

    // 다음 페이지 버튼 이벤트 (아래쪽)
    nextBtn.addEventListener('click', goToNextPage);

    // 이전 페이지 버튼 이벤트 (위쪽)
    prevBtnTop.addEventListener('click', goToPrevPage);

    // 다음 페이지 버튼 이벤트 (위쪽)
    nextBtnTop.addEventListener('click', goToNextPage);

    // 첫 진입 시 PDF 숨김
    hidePdf();

    // 발표자료 버튼 이벤트
    btnIntro.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (selected === 'intro') {
            hidePdf();
            btnIntro.classList.remove('selected');
            selected = null;
        } else {
            loadPDF('https://solicare.kro.kr/pdf/project-intro.pdf');
            showPdf();
            // 발표자료는 위쪽 컨트롤 숨김
            pdfControlsTop.style.display = 'none';
            btnIntro.classList.add('selected');
            btnPoster.classList.remove('selected');
            selected = 'intro';
        }
    });

    // 포스터 버튼 이벤트
    btnPoster.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (selected === 'poster') {
            hidePdf();
            btnPoster.classList.remove('selected');
            selected = null;
        } else {
            loadPDF('https://solicare.kro.kr/pdf/project-poster.pdf');
            showPdf();
            // 포스터는 위쪽 컨트롤 보임 (긴 PDF이므로)
            pdfControlsTop.style.display = 'flex';
            btnPoster.classList.add('selected');
            btnIntro.classList.remove('selected');
            selected = 'poster';
        }
    });

    // 레포 카드 클릭 이벤트
    const repoCards = document.querySelectorAll('.repo-card');
    const repoLinks = document.querySelectorAll('.repo-link');

    // 레포 링크 직접 클릭 이벤트
    repoLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.open(this.href, '_blank');
        });
    });

    // 카드 전체 클릭 이벤트 (링크 클릭 시 중복 실행 방지)
    repoCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // 링크를 직접 클릭한 경우 중복 방지
            if (e.target.classList.contains('repo-link')) {
                return;
            }

            const link = card.querySelector('.repo-link');
            if (link) {
                window.open(link.href, '_blank');
            }
        });
    });
});
