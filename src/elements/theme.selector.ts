export class ThemeSelector{
    private link: HTMLElement
    private isDayMode = true
    constructor(){
    }

    public renderTo(container: HTMLElement){
        this.link = document.createElement('a')
        this.link.innerHTML = 'Switch to Night Mode'
        this.link.addEventListener('click', (e) => {
            this.isDayMode = !this.isDayMode
            this.applyTheme()
        })
        container.appendChild(this.link)
    }

    private applyTheme(){
        if(this.isDayMode){
            this.link.innerHTML = 'Switch to Night Mode'
            document.getElementsByTagName('body')[0].className=''
        }else{
            this.link.innerHTML = 'Switch to Day Mode'
            document.getElementsByTagName('body')[0].className='night'
        }
    }
}