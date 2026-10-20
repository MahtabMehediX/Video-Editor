// Reveal each stack section's content when it becomes the active (pinned) one

const sections = document.querySelectorAll(".stack-section");

const revealObserver = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("in-view");

        }

    });

},
{

    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px"

});


sections.forEach(sec=>{

    revealObserver.observe(sec);

});


// Smooth section navigation
// Sections now live in normal document flow (no longer pinned via
// `position: sticky`), so we no longer need to compute scroll offsets
// manually — the browser's own scrollIntoView handles it correctly.

document.querySelectorAll('a[href^="#"]').forEach(link=>{

    link.addEventListener("click", (e)=>{

        const targetId = link.getAttribute("href").slice(1);
        const targetSection = document.getElementById(targetId);

        if(!targetSection) return;

        e.preventDefault();

        const burgerEl = document.getElementById("burger");
        const mobilePanelEl = document.getElementById("mobilePanel");
        if(burgerEl) burgerEl.classList.remove("open");
        if(mobilePanelEl) mobilePanelEl.classList.remove("open");

        targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


// Auto-hide navbar on scroll down, reveal on scroll up
const navEl = document.querySelector(".nav");
let lastScrollY = window.scrollY;

if(navEl){
    window.addEventListener("scroll", ()=>{

        const currentScrollY = window.scrollY;

        if(currentScrollY < 80){
            navEl.classList.remove("nav-hidden");
        } else if(currentScrollY > lastScrollY){
            navEl.classList.add("nav-hidden");
        } else if(currentScrollY < lastScrollY){
            navEl.classList.remove("nav-hidden");
        }

        lastScrollY = currentScrollY;

    }, { passive:true });
}


// Precisely size the process timeline line to span exactly between
// the center of the first step and the center of the last step —
// avoids the line overshooting past the final checkmark.
function updateProcessLine(){
    const list = document.querySelector(".process-list");
    const line = document.querySelector(".process-line");
    if(!list || !line) return;

    const nums = list.querySelectorAll(".process-num");
    if(nums.length < 2) return;

    const listRect = list.getBoundingClientRect();
    const firstRect = nums[0].getBoundingClientRect();
    const lastRect = nums[nums.length - 1].getBoundingClientRect();

    const top = (firstRect.top + firstRect.height / 2) - listRect.top;
    const bottom = (lastRect.top + lastRect.height / 2) - listRect.top;

    line.style.top = top + "px";
    line.style.height = Math.max(0, bottom - top) + "px";
}

window.addEventListener("load", updateProcessLine);
window.addEventListener("resize", updateProcessLine);


// Mobile hamburger menu toggle
const burger = document.getElementById("burger");
const mobilePanel = document.getElementById("mobilePanel");

if(burger && mobilePanel){
    burger.addEventListener("click", ()=>{
        burger.classList.toggle("open");
        mobilePanel.classList.toggle("open");
    });
}


// Sliding hover indicator for the nav links
const navLinksEl = document.querySelector(".nav-links");
const navIndicator = document.querySelector(".nav-indicator");
const navItems = document.querySelectorAll(".nav-links a");

function moveIndicatorTo(el){
    const containerRect = navLinksEl.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    navIndicator.style.left = (rect.left - containerRect.left) + "px";
    navIndicator.style.width = rect.width + "px";
    navIndicator.style.opacity = "1";
}

navItems.forEach(item=>{
    item.addEventListener("mouseenter", ()=> moveIndicatorTo(item));
});

if(navLinksEl){
    navLinksEl.addEventListener("mouseleave", ()=>{
        navIndicator.style.opacity = "0";
    });
}


// Work cards: click a card to play its video + see the edit breakdown
(function(){
    const modal = document.getElementById("videoModal");
    if(!modal) return;

    const player   = modal.querySelector(".vm-video");
    const emptyMsg = modal.querySelector(".vm-empty");
    const errorMsg = modal.querySelector(".vm-error");
    const titleEl  = modal.querySelector(".vm-title");
    const tagEl    = modal.querySelector(".vm-tag");
    const detailEl = modal.querySelector(".vm-detail");
    const closeBtn = modal.querySelector(".vm-close");
    let lastFocus = null;

    function openModal(card){
        lastFocus = document.activeElement;

        const src = card.dataset.video || "";
        titleEl.textContent = card.querySelector(".work-meta h3").textContent;
        tagEl.textContent   = card.querySelector(".work-meta span").textContent;

        detailEl.innerHTML = "";
        const tpl = card.querySelector("template");
        if(tpl) detailEl.appendChild(tpl.content.cloneNode(true));

        errorMsg.hidden = true;
        if(src){
            emptyMsg.hidden = true;
            player.hidden = false;
            player.src = src;
            player.load();
            player.play().catch(()=>{});
        } else {
            player.hidden = true;
            emptyMsg.hidden = false;
        }

        modal.hidden = false;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    }

    function closeModal(){
        player.pause();
        player.removeAttribute("src");
        player.load();
        modal.hidden = true;
        document.body.style.overflow = "";
        if(lastFocus) lastFocus.focus();
    }

    document.querySelectorAll(".work-card").forEach(card=>{
        card.addEventListener("click", (e)=>{
            e.preventDefault();
            openModal(card);
        });

        // Use the poster image as the card thumbnail, only if the file exists
        const poster = card.dataset.poster;
        const thumb  = card.querySelector(".work-thumb");
        if(poster && thumb){
            const img = new Image();
            img.onload = ()=>{
                thumb.style.backgroundImage = 'url("' + poster + '")';
                thumb.style.backgroundSize = "cover";
                thumb.style.backgroundPosition = "center";
            };
            img.src = poster;
        }
    });

    player.addEventListener("error", ()=>{
        if(modal.hidden || !player.getAttribute("src")) return;
        player.hidden = true;
        errorMsg.hidden = false;
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e)=>{
        if(e.key === "Escape" && !modal.hidden) closeModal();
    });
})();
