React

예제 연습용 간단 설정

- --npx create-react-app [프로젝트명]
- --cd [프로젝트명]
- --npm start
- --서버 실행 뒤 자동으로 브라우저까지 띄움.

Component

- --import {Component} from &#39;react&#39;
- --class [컴포넌트명] extends Component {}
  - 컴포넌트 정의
  - 모든 컴포넌트는 render 함수가 있어야 하며 이 함수는 return () 을 통해 렌더링 할 내용을 반환 함.
- --export default [컴포넌트명];
  - js 파일에서 기본적으로 반환할 컴포넌트. 설정 안해주면 컴파일 에러

Props

- --컴포넌트를 생성할 때 정보를 prop를 통해 전달함.
- --&lt;[컴포넌트명] [속성명]=[값]/&gt;
  - 값에서 자바스크립트 변수에 접근하기 위해 {}를 사용할 수 있다.
- --컴포넌트 안에서는 this.props.[속성명] 으로 값에 접근 가능하다.
- --같은 컴포넌트가 여러 개일 경우 key라는 속성으로 서로 구분이 가능하게 만들어줘야 한다.
- --클래스에서 propTypes ={} 에서 각각의 props에 대한 형식을 체크할 수 있다. (틀리면 콘솔에 에러)
  - npm install --save prop-types
  - import PropTypes from &#39;prop-types&#39;;
  - [속성명]: PropTypes.[형식]
  - [속성명]: PropTypes.[형식].isRequired // 필수

{}

- --렌더링의 return 안의 html 안의 {}는 자바스크립트 실행을 의미한다.

Component life cycle

- --컴포넌트가 가지는 함수들이 있다. 특정한 상황에서 실행되는.
- --렌더링
  - componentWillMount()
  - render()
  - componentDidMount()
- --업데이트 새로운 props가 들어왔을 때
  - componenetWillReceivedProps()
  - shouldComponenetUpdate() // props를 비교해서 변경된 게 있을 경우 다음으로 넘어간다
  - compoenetWillUpdate() // 로딩바 같은 거 표시할 수 있다.
  - render()
  - componenetDidUpdate()

component state

- --state는 모든 컴포넌트 안에 있는 오브젝트다.
- --state가 변경되면 component는 다시 랜더링 된다. render 함수 다시 실행됨.
- --this.state.[속성] 으로 값에 접근 가능.
- --값을 바꿀 때는 this.setState([state 오브젝트])로 해줘야 정상적으로 render함수 일어남.
- --특정 this.state.[속성]가 존재한다면 화면에 표시. 없으면 loading 출력할 수 있다.
  - 만약 render함수에서 state 속성에 바로 접근하려고 하는데 로딩되어 있지 않으면 오류가 뜨니까.

stateless functional component

- --dump 컴포넌트라고 불린다. state는 없고 props만 있는 경우
- --특정 컴포넌트는 state가 필요 없다. render 이런 함수들이 필요 없는 경우 그냥 function으로 만들어버린다.
- --function [컴포넌트명] ({prop이름}) {return (화면에 표시할 내용)}
- --여러 개: { prop이름 , prop이름 , prop이름 } 인자로 보내기
- --propTypes 설정:
  - [컴포넌트명].propTypes = {속성명: PropTypes.값종류}

AJAX

- --비동기 통신
- --기본적으로 fetch를 통해 url에 요청을 보냄
- --fetch는 promise를 반환함.
- --promise에 .then() 함수와 .catch() 로 콜백 함수를 설정한다
  - then: response 오브젝트 반환한다
    - then은 여러 개 설정 가능하다. 첫번째 반환 값이 두번째 then으로 들어가는 듯
  - catch: error 오브젝트 반환한다
- --요청을 여러 개 순서대로 하고 싶을 때 async와 await를 쓰면 then 지옥에서 벗어날 수 있다
  - 함수 앞에 async를 써서 끝낼 필요가 없는. 함수라는 것을 나타낸다.
    - 함수이름 = async () =&gt; {}
  - 함수 안에서 await 로 함수로 함수를 호출하면 해당 함수가 끝날 때까지 기다린다.
  - await로 호출한 함수가 promise를 반환하면 기다렸다가 then에서 return하는 값을 가지게 한다.

배포

- --실행은 npm start였지만
- --빌드하려면 npm run-script build 하면 build 폴더에 빌드된다.

자바스크립트 [] {}

- --[]: 배열. 순서대로 저장한다.
- --{}: 오브젝트. 키와 값의 쌍으로 저장한다.

자바스크립트 array

- --foreach 함수
  - 하나씩 돌면서 콜백 함수를 호출함.
- --map 함수
  - 하나씩 돌면서 콜백 함수에 집어넣고 return 값들로 새로운 배열을 만듦.
  - 첫째 인수: 요소        둘째 인수: index
- --filter 함수
  - 하나씩 돌면서 콜백 함수에 집어넣고 return이 true인 것 들로만 새로운 배열을 만듦.
- --…[배열명] 점 세 개를 쓰면 그 자리에 배열이 들어간다.
  - […arr, b, c] // arr배열에 b, c를 추가한 것이 됨.

Electron

개발 환경 설정

- --폴더 안에서 npm init -y 하면 node.js 패키지 기본 설정 자동으로 됨.
  - package.json이 생긴다.
  - scripts에 콘솔창 명령어 시 실행될 것을 지정 가능하다.
- --npm i electron -D
  - 현재 패키지 폴더에 electron 설치 D 옵션은 개발 의존성 모드
  - scripts에 start에 해당하는 항목을 electron . 으로 설정해 일렉트론이 실행되게 한다.
    - 실행: npm start
  - main에 지정된 파일로부터 electron이 시작된다.

모듈 불러오기

- --const {app, BrowserWindow} = require(&#39;electron&#39;);
- --해당 모듈만 불러온다.

app 모듈

- --app은 어플리케이션 관련 모듈. 앱이 실행되면 다양한 이벤트가 실행된다.
- --이벤트에 바인딩 방법: app.on(&quot;이벤트명&quot;, 사용자 함수)
  - will-finish-launching: 시작 시. 업데이트 관련 등을 처리
  - ready: 앱이 준비 됐을 시
    - launchinfo를 받을 수 있다. 명령 옵션 등을 확인 가능.
  - window-all-closed: 모든 윈도우가 닫혔을 시.
    - 사용자가 함수를 바인딩 해버리면 quit이 자동으로 일어나지 않는다.
    - 수동으로 종료하려면 app.quit() 실행
  - before-quit: 종료하기 전
    - event를 받을 수 있다.
  - will-quit: 종료될 것 임
    - event를 받을 수 있다.
  - quit: 완전 종료
    - event를 받을 수 있다.
  - activate: 맥 os일 경우에만 발생
    - event와 hasVisibleWindows를 받아온다. 독을 눌렀을 때 발생
- --이벤트를 받아오는 경우 event.preventDefault();로 이벤트의 기본 동작을 막을 수 있다

Browser Window 모듈 (BrowserWindow)

- --생성
  - const win = new BrowserWindow({

width: 600, // 윈도우 가로

height: 500 // 윈도우 세로

minWidth: maxWidth: minHeight: maxHeight: // 최대 최소 가로 세로

movable: true / false // 움직일 수 있는지

title: &#39;타이틀 명&#39;

frame: true / false // 프레임이 있고 없는지

titleBarStyle: hidden / hidden-inset /  // 프레임이 있게 하지만 타이틀 바의 스타일을 수정 맥에서만 가능

show: false // 처음에 실행될 때 안보이게 함.

parent: [window 인스턴스] // 부모를 설정해서 만들 음. 부모에 종속. 부모가 꺼지면 같이 꺼짐

modal: true // 자신의 부모 창을 조작 불가능하게 함. 맥에서는 메시지 창처럼 생성됨.

});

- --내용 로드하기
  - win.loadURL(&#39;url 주소&#39;)
  - win.loadFile(&#39;file 경로&#39;) // 상대 경로도 가능
- --컨텐츠가 로딩이 끝났을 때 화면에 보여주기
  - win.on(&#39;ready-to-show&#39;, ()=&gt; { win.show(); });
- --윈도우 객체의 이벤트 win.on(&#39;이벤트&#39;, 함수)로 바인딩
  - ready-to-show: 보여줄 내용 로딩 완료시
  - show: 보여질 때. hide: 안보일 때
    - 포커스를 잃는게 아님. 윈도우에서는 직접 show() hide() 호출 시 일어남
  - close: 꺼질 때
  - closed: 창이 완전히 사라지고 난 후
  - focus: 포커스
  - blur: 포커스를 잃을 때
  - move: 움직일 때
  - moved: 움직이고 나서 // 맥에서만
- --캡쳐
  - capturePage

디버깅

- --win.webContents.openDevTools(); 크롬 개발자 도구 띄우기
- -- [https://electronjs.org/docs/tutorial/debugging-main-process-vscode](https://electronjs.org/docs/tutorial/debugging-main-process-vscode) : vs code 디버거 설정(중단점)

렌더러 프로세스

- --remote
  - const {remote} = require(&#39;electron&#39;)
  - remote.getCurrentWindow(); // 현재 윈도우를 받아옴
  - remote.getAllWindows(); // 모든 윈도우를 배열로 받아옴.
- --BrowserWindow
  - BrowserWindow.getFocusedWindow(); // 현재 윈도우를 받아옴
- --메인에서 쓰는 다른 모듈들을 remote에서 가져올 수 있다.
  - const {Menu, MenuItem, BrowserWindow} = remote

메뉴 모듈 (Menu)

- --const menu = Menu.buildFromTemplate(json 형태 메뉴)
  - template: 배열.
    - { label:&#39;보여질 이름&#39;, submenu:하위 메뉴 배열, click:실행함수 }
    - { type:&#39;separator&#39; } // 구분 자
    - { type:&#39;checkbox&#39; } // 선택 가능한 메뉴
- --Menu.setApplication(menu); // 앱에 적용
- --메뉴 아이템 모듈 (MenuItem)
  - 이런 식으로 메뉴 아이템을 하나씩 append 가능.
  - menu = new Menu()
  - menuItem = new MenuItem({label…})
  - menu.append(menuItem)
- --menu.popup(윈도우창)
  - 해당 윈도우 창에 오른쪽 클릭 메뉴를 띄움. 마우스 위치

Tray 모듈 (Tray)

- --const tray = new Tray(&#39;아이콘 png 파일 경로&#39;);
  - icon.png // icon@2x.png: 레티나 버전
- --tray 이벤트
  - click: 좌 클릭 시
  - right-click: 우 클릭 시
- --트레이에 메뉴를 띄우려면
  - tray.setContextMenu(menu);

Dialog 모듈 (dialog)

- --파일 불러오기
  - dialog.showOpenDialog({

filters: [{name: &quot;image&quot;, extensions: [&#39;jpg&#39;, &#39;png&#39;]}] // 파일 선택 필터

properties: [&#39;openFile&#39;, &#39;multiSelections&#39;] // 옵션으로 파일을 열겠다. 다중 선택

}, 콜백 함수(경로를 인자))

- --파일 저장하기
  - dialog.showSaveDialog({

title: &#39;title&#39;,

message: &#39;message&#39;, // 윈도우에서는 안 먹음

filters: [{name: &quot;image&quot;, extensions: [&#39;jpg&#39;]}] // 확장자 안 넣으면 자동으로

}, 콜백 함수(경로를 인자))

})

- --메시지 박스
  - dialog.showMessageBox({

message: &#39;message&#39;,

detail: &#39;detail&#39;,

buttons: [&#39;first&#39;, &#39;second&#39;] // 왼쪽부터 0번 1번

checkboxLabel: &quot;checkbox&quot;, // 체크 박스 내용

checkboxChecked: true // 초기값

}, 콜백 함수(누른 버튼의 인덱스를 인자, 체크박스 체크 여부) );

- --에러 박스
  - dialog.showErrorBox(&#39;제목&#39;, &#39;내용&#39;);

ipc 통신 (ipcRenderer ipcMain)

- --main &lt;-&gt; renderer 통신을 위해 사용함
- --비동기 방식
  - ipcRenderer.send(&#39;채널명&#39;, 데이터);
  - ipcMain.on(&#39;채널명&#39;, (event, message) =&gt; {})
    - event.sender : 메시지를 보낸곳
    - event.sender.send 가능
- --동기 방식
  - ipcRenderer.sendSync(&#39;채널명&#39;, 데이터) // 대답이 올 때까지 기다렸다가 대답을 반환함.
  - on은 똑같이 작성.

Shell 모듈 (shell)

- --main, renderer 둘 다 가능
- --shell.openExternal(&#39;파일 주소 또는 URL&#39;); 기본적인 실행

Exe 실행 (Node.js 모듈)

- --const child = require(&#39;child\_process&#39;).execFile;
- --child(경로, 파라미터 배열, (err, data) =&gt; {});

레지스트리 모듈 (node.js 모듈)

- -- [https://github.com/ironsource/node-regedit](https://github.com/ironsource/node-regedit)
- --npm install regedit
- --regedit.list / regedit.putValue

다운로드 모듈 ( [https://github.com/sindresorhus/electron-dl](https://github.com/sindresorhus/electron-dl))

- --s

POP 메일 모듈 (node.js 모듈)

- -- [https://github.com/ditesh/node-poplib](https://github.com/ditesh/node-poplib)
- --npm install poplib -&gt; 수정해야 돼서 프로젝트 안으로 가져옴
- --npm install mailparser -&gt; 메일 파싱

react 연동

- --webpack 설치
  - npm i webpack -D
  - npm I webpack-cli -D
  - npm i babel-loader babel-core -D
  - npm i babel-preset-env babel-preset-react -D
  - renderer 폴더 만들기. 폴더 안에 index.js 만들기
  - 프로젝트 폴더에 webpack.config.js 만들기

module.exports = {

    target: &#39;electron-renderer&#39;,

    entry: &#39;./renderer/index.js&#39;,

    output: {path: \_\_dirname,filename: &#39;bundle.js&#39;},

    module: {rules: [{exclude: /node\_modules/,loader: &#39;babel-loader&#39;,

}]

    }

};

-
  - npm i babel-plugin-transform-class-properties
  - .babelrc 파일 만들기

{

    &quot;presets&quot;: [&quot;env&quot;, &quot;react&quot;],

    &quot;plugins&quot;: [&quot;transform-class-properties&quot;]

}

-
  - package.json에서 scripts에 webpack: &quot;webpack&quot; 추가
  - npm run webpack 해보기 (webpack-cli 설치 요구 시 설치) – build.js 생성됨
  - npm i react react-dom
  - 기존 index.html에서 script로 require(&#39;./bundle.js&#39;) 해줌
  - 기존 index.html에서 body에 id가 root인 div 하나 넣음.
  - 시작 포인트: ./renderer/index.js 여기에서
    - import App from &#39;./component/App&#39;
    - ReactDom.render(&lt;App /&gt;, document.querySelector(&#39;#root&#39;));
  - ./renderer/components 폴더에 리액트 컴포넌트들을 만든다

자동 업데이터 겸 빌드

- --npm i electron-builder -D // 빌더
- --npm i electron-updater // 업데이터
- --빌드 관련
  - Package.json에 빌드 설정 ( [http://knphouse.co.kr/88](http://knphouse.co.kr/88))

&quot;build&quot;: {

    &quot;appId&quot;: &quot;com.lemon-puppy.electronpractice&quot;,

    &quot;win&quot;: {

      &quot;target&quot;: [

        &quot;nsis&quot;

      ],

      &quot;icon&quot;: &quot;./build/icon.ico&quot;

    },

    &quot;nsis&quot;: {

      &quot;oneClick&quot;: true,

      &quot;createDesktopShortcut&quot;: &quot;always&quot;,

      &quot;installerHeaderIcon&quot;: &quot;./build/icon.ico&quot;

    }

}

-
  - Package.json script 설정
    - &quot;dist&quot;: &quot;electron-builder&quot;,
    - &quot;postinstall&quot;: &quot;electron-builder install-app-deps&quot;
  - Package.json 기타 설정
    - &quot;version&quot;: &quot;&quot; // 현재 버전
    - &quot;description&quot;: &quot;&quot; // 설명
- --업데이터 관련
  - Package.json 설정
    - &quot;repository&quot;: &quot;git 주소&quot;: 자동으로 하려면 npm init -y
  - Npm run dist 하면 dist 폴더에 설치파일과 lastest.yml이 만들어짐. 이 파일들을 git 저장소에 release 시킴
  - 업데이터는 가장 최근 릴리즈의 lastest.yml를 검사함. 이 안에 url하고 파일명 맞춰줘야 함. 파일명 그대로 두고 lastest.yml을 수정해야 checksum 검사 통과 가능.
  - 업데이터 예제
    - [https://github.com/iffy/electron-updater-example/blob/master/main.js](https://github.com/iffy/electron-updater-example/blob/master/main.js)
    - const {autoUpdater} = require(&quot;electron-updater&quot;);
    - 단순 예제
      - autoUpdater.checkForUpdatesAndNotify();
    - 복잡한 건
      - autoUpdater.checkForUpdates(); 해서 이벤트로 하나씩 검사해야 함. 예제 참고

node.js

- --``를 쓰면 멀티라인과 변수를 쉽게 문자열에 넣을 수 있다
  - `${변수명}`
- --process
  - versions, platform(os 판별가능 darwin/win32), type(렌더러인지 메인인지)
- --xml 파싱
  - npm i xml-parser
  - var parse = require(&#39;xml-parser&#39;);
  - var obj = parse(xml);
- --xml 파싱 이거로 바꾸자
  - npm install xml2js

var xml2js = require(&#39;xml2js&#39;);

var parser = new xml2js.Parser();

parser.parseString(xml, function(err, result) {

  console.log(result);

});

- --exe 실행시키기

var child = require(&#39;child\_process&#39;).execFile;

var executablePath = &quot;C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe&quot;;

var parameters = [&quot;--incognito&quot;];

child(executablePath, parameters, function(err, data) {

     console.log(data.toString());

});

css

- ---webkit-app-region: drag;
  - 드래그 가능하게 함.
- ---webkit-user-select: false;
  - 내용을 선택 못하게 함

js

- --document.querySelector / querySelectorAll 로 DOM 오브젝트 선택
- --DOM 오브젝트에 .addEventListener(&#39;click&#39;, 함수) 이렇게 리스너 적용 가능
- --window.addEventListener(&#39;contextmenu&#39;, (event) =&gt; {
- --            event.preventDefault();
- --            menu.popup(BrowserWindow.getFocusedWindow());
- --}) // 우클릭 메뉴 띄우기
- --var, let, const
  - var: 구식. 함수 단위. 재선언 오류 안 뜸.
  - let: 신식. 블록 단위. 재선언 불가능.
  - const: 신식. 블록 단위 재선언 불가능. 값 변화 불가능.

git

- --상태
  - U: unmodified: 수정 안된 상태
  - M: modified: 수정됨
  - S: staged: 커밋 전 단계. 커밋할 때 얘들만 올라감.
  - 커밋: 변경된 내용을 git에 저장함. 로컬에 저장하는 것.
    - git commit -m &quot;메세지&quot;
- --원격 저장소
  - 원격 저장소 추가
    - git remote add [단축이름] [url]
  - 원격 저장소 확인
    - git remote -v
  - 데이터 가져오기
    - git fetch [리모트 저장소 이름]
    - 가져온 내용을 merge 하거나 살펴볼 수 있다
  - 데이터 가져와서 합치기
    - git pull [리모트 저장소 이름]
  - 원격 저장소에 push 하기
    - git push [리모트 저장소 이름] [지역 브랜치 이름]
- --예외 처리
  - .gitignore 파일에서
- --Package.json에 자동 등록
  - npm init -y

node.js

- --노드 실행
  - node file.js
- --자바스크립트와 동일.
- --document 보면서 공부
  - [https://nodejs.org/dist/latest-v8.x/docs/api/](https://nodejs.org/dist/latest-v8.x/docs/api/)

모듈 관리

- --모듈의 top level 변수는 유지된다. let으로 설정해도.
- --모듈 구조
  - exports.[속성명] = [함수/속성/값]
- --모듈 불러오기
  - 모듈변수 = require(&#39;./모듈명.js&#39;);
    - 모듈변수.[속성명] 으로 해당 함수/정보에 접근
  - { [속성명] } = require(&quot;모듈명&quot;); // 노드에서 사용 가능????
    - [속성명]으로 해당 함수/정보에 접근

request 모듈

- --npm init -y 부터
- --npm install request
- --여러 모듈에서 동일한 jar 사용
  - [https://stackoverflow.com/questions/33506393/node-js-cookie-with-request-jar](https://stackoverflow.com/questions/33506393/node-js-cookie-with-request-jar)
  - 모듈의 top level 변수는 유지된다.
- --npm install iconv-lite , npm install charset
  - en-kr 인코딩 위해서. 요청 보낼 때 encoding:null; 해준 뒤
  -