$(document).ready(function () {
	if (
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		)
	) {
		//모바일이라면
		mobile = 1;
		mobileWaterFreq = 50;
	} else {
		//데스크탑 전용
		mobileWaterFreq = 0;
		mobile = 0;
	}
	/** 변수 초기화 **/
	rainInit = 0;
	ampInit = 0;
	firstClick = 1;

	// 조건 만족시까지 대기.
	var checkloop = function (condition) {
		if (condition == 1) {
			return;
		} else {
			setTimeout(checkloop, 1000); // check again in a second
		}
	};

	// 일정 범위 랜덤 정수 생성
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	// initialize
	function init() {
		document.querySelector(".howareyou").focus();
		var audio = document.querySelector(".bgm");
		audio.prop("volume", 0);
		audio.trigger("play");
		// 비내리기 시작.
	}

	function breakWord(text) {
		var father = $('<div class="letters"></div>');
		var splitText = text.replace(
			/\S+\s*/g,
			'<span class="floatingLetter2">$&</span>'
		);
		father.html(splitText);
		return father;
	}

	// 글자에 css를 부여
	function cssWord(text) {
		textbox = $(".howareyou");
		text.children().each(function () {
			$(this).css("display", "none");
			$(this).css("top", getRandomInt(5, 80) + "%");
			$(this).css("left", getRandomInt(5, 95) + "%");
			$(this).css("padding-top", textbox.css("padding-top"));
			$(this).css("padding-left", textbox.css("padding-left"));
			$(this)
				.attr("data-float-duration", "0.3")
				.attr("data-float-translate", "1")
				.addClass("floating_text")
				.addClass("run-animation");
		});
		return text;
	}
	function flyWord(word) {
		var interval = 0;
		word.each(function () {
			interval += 1500;
			$(this).velocity("fadeIn", interval, function () {});
		});
	}
	function downWord() {
		var interval = 0;
		var word = $("body> .letters");
		word.children().each(function () {
			setTimeout(() => {
				$(this).addClass("onSky");
			}, interval);
			interval += 1500;
		});
	}
	$("body> .letters").on("animationend", ".floatingLetter2", function (e) {
		if (e.originalEvent.animationName == "downToWater") {
			var word = $(this);
			word.velocity("fadeOut", 500, function () {
				word.css("top", 50 * Math.random() + "px");
				word.removeClass("onSky");
				word.addClass("onWater");
				word.appendTo("#waterlevel>.letters");

				$(this).css("filter", "opacity(" + getRandomInt(50, 100) + "%)");

				FLOATING_TEXT.float(word[0]);
				moveWord(word);
			});
		}
	});

	function moveWord(word) {
		var sealevel = $("#waterlevel");
		word.velocity("fadeIn", 300);
		function swim() {
			word.velocity(
				{
					//해수면 속에서 움직이는 글자
					left: sealevel.innerWidth() * Math.random() + "px",
					top: 150 * Math.random() + "px",
				},
				{ duration: 30000, complete: swim }
			);
		}
	}

	// ** 날씨 조정 ** //
	function night() {
		$("body").velocity(
			{
				backgroundColor: "#424b70",
			},
			1000
		);
		$(".ask").css("color", "white");
	}
	function sun() {
		$(".sun").fadeIn(1000);
	}
	// ** 비 ** //
	function rain() {
		// 비를 내림
		if ($(".rain").css("display") == "none") {
			if ($(".rain").css("opacity") < 0) {
				return;
			}
			$(".rain").velocity("fadeIn", 2000);
			$(".waves").velocity("fadeIn", 2000);
			$(".bgm").trigger("play");
			rain_settings();
		} else {
			$(".rain").velocity("fadeOut", 2000);
			$(".waves")
				.delay(1600)
				.velocity("fadeOut", 500, function () {
					$(".waves").empty();
				});
			$(".bgm").trigger("pause");
		}
	}
	function rain_settings() {
		// 비와 관련된 설정들
		$(".rain__drop").css("animation-iteration-count", "infinite");
		hideRainAmount(70);
		setvolume(0.7);
	}

	//** 빗줄기 *//
	// 빗줄기 보이기
	function showRainAmount(i, gage) {
		setTimeout(function () {
			//if ($('.rain__drop').eq(i+100).hasClass('hided')){
			$(".rain__drop")
				.eq(i + 100)
				.removeClass("hided"); //}
			//if ($('.rain__drop').eq(i).hasClass('hided')){
			$(".rain__drop").eq(i).removeClass("hided"); //}
			i++;
			if (i < gage) {
				showRainAmount(i, gage);
			}
		}, 0.1);
	}
	// 빗줄기 삭제
	function hideRainAmount(gage) {
		var y = gage;
		var suby = y + 100;
		setTimeout(function () {
			//if (!$('.rain__drop').eq(y).hasClass('hided')){
			$(".rain__drop").eq(y).addClass("hided");
			//}if (!$('.rain__drop').eq(suby).hasClass('hided')){
			$(".rain__drop").eq(suby).addClass("hided"); //}
			y++;
			suby++;
			if (y < 100) {
				hideRainAmount(y);
			}
		}, 0.1);
	}
	// 빗줄기 갯수 조절
	function controlRainAmount(gage) {
		if (mobile == 1) {
			gage = Math.floor(gage / 3);
		}
		hideRainAmount(gage);
		var i = 0;
		showRainAmount(i, gage);
	}

	// ** 바닥 빗방울 ** //
	// 빗방울 땅에 튀기는 애니메이션 시작 -->
	floorRippleOn = 1;
	function floorRipple(x) {
		var wave = $('<div class="wave"></div>');
		wave.css("left", x + "%");
		wave.appendTo(".waves");
	}
	$(".rain__drop").on("animationiteration", function () {
		if (floorRippleOn == 1) {
			//해수면이 없다는 뜻
			if (mobile == 1) {
				// 모바일은 빗방울 1/3
				var doRipple = Math.random();
				if (doRipple < 0.3) {
					var x = $(this).css("--x");
					floorRipple(x);
				} else {
					return;
				}
			} else {
				//데스크탑
				var x = $(this).css("--x");
				floorRipple(x);
			}
		}
	});
	// 빗방울 튀기면 삭제   <-- 빗방울 애니메니션 끝
	$(document).on("animationend", ".wave", function () {
		$(this).remove();
	});

	// ** 해수면 ** //
	function waterLevelFill() {
		var adjustedFreq =
			$("#rainControlBar")[0].noUiSlider.get() - mobileWaterFreq;
		$("#waterlevel").raindrops({
			color: "#344274",
			waveLength: 700,
			waveHeight: 50,
			frequency: adjustedFreq,
		});
	}
	function waterRippleFreq(gage) {
		// [1] 해수면에 빗방울 첨벙이는 빈도
		var waterRippleFreq = gage;
		if (mobile == 1) {
			//모바일
			var waterRippleFreq = Math.floor(waterRippleFreq / 3);
		} else {
			// 데스크탑
			if (gage < 10) {
				var waterRippleFreq = gage + 3; // 최소 frequency 값
			}
		}
		$("#waterlevel").raindrops({
			//수면에 튀기는 물방울 정도
			frequency: waterRippleFreq,
		});
	}
	function floorRippleOnOff() {
		//해수면의 높이에 따라 바닥 빗방울 활성화/비활성화
		var waterLevelUp = 0;
		var floorRippleToggle = setInterval(() => {
			var waterbottom = Math.abs(parseInt($("#waterlevel").css("bottom"), 10));
			if (waterbottom < 125) {
				//빗줄기가 바닥에 닿는 그 지점을 덮을 정도
				$(".waves").hide();
				$(".waves").empty();
				floorRippleOn = 0;
				waterLevelUp = 1;
			} else if (waterbottom > 110 && waterLevelUp == 1) {
				$(".waves").show();
				floorRippleOn = 1;
				if (waterbottom == 150) {
					cleanWordsInWater(); //물 안에 있는 모든 글자 삭제.
					clearInterval(floorRippleToggle); // 수면 높이 실시간 체크 비활성화
				}
			}
		}, 2000);
	}
	function waterLevel_init(gage) {
		waterLevelFill();
		//controlRainAmount(gage);
		controlWaterLevel(gage);
		waterRippleFreq(gage);
		automateWaterLevel();
		//floorRippleOnOff();
	}
	waterlevel = 0;
	function automateWaterLevel() {
		setInterval(() => {
			if (waterlevel < 50) {
				controlWaterLevel(100);
				waterlevel = 100;
			} else {
				controlWaterLevel(0);
				waterlevel = 0;
			}
			floorRippleOnOff();
		}, 10000);
	}

	function controlWaterLevel(gage) {
		// 비 양 게이지에 따라 해수면 높이 애니메이션 실행
		if (gage > 40) {
			if (!$("#waterlevel").hasClass("active")) {
				$("#waterlevel").addClass("active");
			}
			waterLevelAnimation(".active", waterLevelSpeed(gage), "0px");
		} else {
			$("#waterlevel").removeClass("active");
			waterLevelAnimation("", waterLevelSpeed(gage), "-150px");
		}
	}
	// * 부수적으로 따라 움직이는 해수면 함수 * /
	function waterLevelAnimation(class_, speedVal, bottomVal) {
		var time = 80000 * speedVal.toFixed(2);
		var tag = "#waterlevel" + class_;
		$(tag).velocity("stop");
		$(tag).velocity(
			{
				bottom: bottomVal,
			},
			{ duration: time }
		);
	}
	function waterLevelSpeed(gage) {
		// [2] 해수면 올라오는 속도
		var waterLevelSpeed = gage / 100;

		// 속도 너무 빠를 경우 조정
		if (waterLevelSpeed == 0 || waterLevelSpeed == 1) {
			var adjustedSpeed = 0.08;
		} else if (waterLevelSpeed > 0.5) {
			if (waterLevelSpeed > 0.85) {
				var adjustedSpeed = 1 - waterLevelSpeed + 0.08;
			} else {
				var adjustedSpeed = 1 - waterLevelSpeed;
			}
		} else {
			if (waterLevelSpeed < 0.15) {
				var adjustedSpeed = waterLevelSpeed + 0.08;
			} else {
				var adjustedSpeed = waterLevelSpeed;
			}
		}
		return adjustedSpeed;
	}
	function cleanWordsInWater() {
		$("#waterlevel>.letters").empty();
	}
	function rainSoundVolume(gage) {
		var bgm_volume = gage / 100;
		if (bgm_volume < 0.05) {
			bgm_volume = 0.05; //최소 음량
		}

		setvolume(bgm_volume);
	}
	//비 양 조절 슬라이더 생성
	function rainControlBarInit() {
		var rainAmountBar = document.querySelector("#rainControlBar");
		noUiSlider.create(rainAmountBar, {
			start: [70],
			range: {
				min: [0],
				max: [100],
			},
		});
	}
	function rainControlBar() {
		var rainAmountBar = $("#rainControlBar");
		if (rainAmountBar.css("display") == "none") {
			rainAmountBar.velocity("fadeIn", 1000);
		} else {
			rainAmountBar.velocity("fadeOut", 1000);
			$("#rainControlBar").remove();
		}
	}
	rainControlBarInit();
	// 빗줄기 양 슬라이더 변경 시
	var rainSlider = document.querySelector("#rainControlBar");

	rainSlider.noUiSlider.on("update", function () {
		if (firstClick != 1) {
			gage = $("#rainControlBar")[0].noUiSlider.get();

			waterLevel_init(gage);
			rainSoundVolume(gage);
			// 빗소리 조절
		}
	});

	function talk() {
		inputopa();
		//tell('이 비가 그치면 언제나처럼');
		//tell('밝은 태양이 당신을 비출거에요.');
		//bgcolor('#b99a34');
		//rain();
		//sun();
	}

	// ** 대사 목록 ** //
	function firstConversation() {
		//$(".info").velocity("fadeOut", 3000);
		var text = $(".howareyou").val();
		$(".howareyou").val("");
		var splitWords = breakWord(text);
		var cssWords = cssWord(splitWords).children();
		cssWords.appendTo($("body > .letters"));
		flyWord(cssWords);
		setTimeout(() => {
			tell("비와 함께 사라지기를");
			var rain = $(".rain");
			rain.velocity("fadeIn", 2000);
		}, 1500);

		setTimeout(() => {
			//rainControlBar();
			//controlRainAmount($("#rainControlBar")[0].noUiSlider.get());
			night();
			//rain();
			rain_settings();
			waterLevel_init($("#rainControlBar")[0].noUiSlider.get());

			setTimeout(() => {
				downWord();
			}, 1000);
		}, 6000);

		$(".howareyou").focus();
	}

	// ** UI 컨트롤 ** //
	// 메인 대사
	totaldelay = 0;
	function tell(txt) {
		setTimeout(() => {
			$(".ask").velocity("fadeOut", 500, function () {
				var target = $(this).text(txt);
				target.velocity("fadeIn", 500);
			});
		}, totaldelay);
		totaldelay = totaldelay + 2500;
	}
	// 배경 색 변경
	function bgcolor(color) {
		$("body").velocity(
			{
				backgroundColor: color,
			},
			2000
		);
	}

	// ** 기타 옵션 ** //
	//볼륨 조정
	function amplifyMedia(mediaElem, multiplier) {
		var context = new (window.AudioContext || window.webkitAudioContext)(),
			result = {
				context: context,
				source: context.createMediaElementSource(mediaElem),
				gain: context.createGain(),
				media: mediaElem,
				amplify: function (multiplier) {
					result.gain.gain.value = multiplier;
				},
				getAmpLevel: function () {
					return result.gain.gain.value;
				},
			};
		result.source.connect(result.gain);
		result.gain.connect(context.destination);
		result.amplify(multiplier);
		return result;
	}

	function setvolume(volumeVal) {
		var audio = $(".bgm");

		audio.animate({ volume: volumeVal }, 800);

		if (ampInit == 0) {
			amp = amplifyMedia($(".bgm")[0], 1);
			ampInit = 1;
		}
		if (volumeVal > 0.85) {
			amp.amplify(2);
		} else {
			amp.amplify(1);
		}
	}

	// 입력창 투명도
	function inputopa() {
		if ($(".inputAndBtn").css("opacity") == 0.5) {
			$(".inputAndBtn").velocity(
				{
					opacity: 1,
				},
				500
			);
			//$('.inputAndBtn').css('opacity','1');
			$(".inputAndBtn")
				.children()
				.each(function () {
					$(this).removeClass("opacity");
				});
		} else {
			$(".inputAndBtn").velocity(
				{
					opacity: 0.5,
				},
				500
			);
			$(".inputAndBtn")
				.children()
				.each(function () {
					$(this).addClass("opacity");
				});
		}
	}
	/** 모바일 설정**/
	// 키보드로 화면 안밀리게
	$(".talk").css("height", window.innerHeight);

	// ** Element events ** //
	$(".send").click(function () {
		if (firstClick == 1) {
			firstClick = 0;
			firstConversation();
		} else {
			var text = $(".howareyou").val();
			$(".howareyou").val("");
			var splitWords = breakWord(text);
			var cssWords = cssWord(splitWords).children();
			cssWords.appendTo($("body > .letters"));
			flyWord(cssWords);
			downWord();
			$(".howareyou").focus();
		}
	});
	$(".howareyou").on("keypress", function (e) {
		if (e.which == 13) {
			$(".send").click();
			if (mobile == 1) {
				$(".howareyou").blur();
			} else {
				$(".howareyou").focus();
			}
			e.preventDefault();
		}
	});

	init();
});
