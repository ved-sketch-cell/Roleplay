import svgPaths from "./svg-qqv2oa8h4m";
import clsx from "clsx";
import imgRectangle from "figma:asset/f7e3084ac4034121dcde1a2b8d6e618c983e6701.png";
import imgEmoji from "figma:asset/f5e8ed5e18219a9790fe8f9683a7a9b98b6cfde8.png";
import imgEmoji1 from "figma:asset/f093a42cf28c94c85caf85e61102e201490f5e1e.png";
import imgEmoji2 from "figma:asset/2341d02b131d118b0bd4f99eff505072b42e65ed.png";
import imgEmoji3 from "figma:asset/21bfc79ed874b9b8a4cb8f366cdacefc77245771.png";
import imgAcfc24B007F742E181C004F11D4128F7 from "figma:asset/a3bb7105ab70dce83dac0d47f81adaf96579cbc4.png";
import { imgGroup162954 } from "./svg-9t3b3";
type BackgroundImageProps = {
  additionalClassNames?: string;
};

function BackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImageProps>) {
  return (
    <div className={additionalClassNames}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        {children}
      </svg>
    </div>
  );
}
type IconBackgroundImageProps = {
  additionalClassNames?: string;
};

function IconBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<IconBackgroundImageProps>) {
  return (
    <BackgroundImage additionalClassNames={clsx("absolute", additionalClassNames)}>
      <g id="Icon">{children}</g>
    </BackgroundImage>
  );
}
type BackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function BackgroundImageAndText({ text, additionalClassNames = "" }: BackgroundImageAndTextProps) {
  return (
    <div className={clsx("content-stretch flex items-center relative shrink-0", additionalClassNames)}>
      <p className="font-['Lato:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#565f60] text-[18px] text-nowrap">{text}</p>
    </div>
  );
}

export default function MessangerProfile() {
  return (
    <div className="bg-white relative size-full" data-name="Messanger Profile">
      <div className="absolute h-[44px] left-0 overflow-clip top-0 w-[375px]" data-name="1. Bars / 1. Status Bar / iPhone X / Light">
        <div className="absolute h-[10.5px] right-[14.5px] top-[calc(50%+1.25px)] translate-y-[-50%] w-[24.5px]" data-name="Battery">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 11">
            <g id="Battery">
              <path d={svgPaths.p12240232} fill="var(--fill-0, #ABABAB)" id="Combined Shape" />
              <path d={svgPaths.p1fe00b00} fill="var(--fill-0, #ABABAB)" id="Combined Shape_2" />
              <rect fill="var(--fill-0, #060606)" height="6.5" id="Rectangle" rx="1" width="18" x="2" y="2" />
            </g>
          </svg>
        </div>
        <div className="absolute inset-[39.39%_11.74%_35.69%_84.18%]" data-name="Wifi">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 11">
            <path clipRule="evenodd" d={svgPaths.p5f54600} fill="var(--fill-0, #060606)" fillRule="evenodd" id="Wifi" />
          </svg>
        </div>
        <div className="absolute inset-[40.15%_17.16%_35.61%_78.31%]" data-name="Mobile Signal">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 11">
            <path clipRule="evenodd" d={svgPaths.pf1d6300} fill="var(--fill-0, #060606)" fillRule="evenodd" id="Mobile Signal" />
          </svg>
        </div>
        <div className="absolute inset-[31.82%_80%_27.27%_5.6%] overflow-clip" data-name="Time Style">
          <p className="absolute font-['SF_Pro_Text:Semibold',sans-serif] leading-[normal] left-0 not-italic right-0 text-[#171717] text-[15px] text-center top-[calc(50%-9px)] tracking-[-0.3px]">9:41</p>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[17px] top-[54px]">
        <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0">
          <div className="content-stretch flex flex-col gap-[2px] items-center relative shrink-0">
            <div className="relative rounded-[800px] shrink-0 size-[100px]" data-name="Rectangle">
              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[800px] size-full" src={imgRectangle} />
            </div>
            <p className="font-['Lato:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#565f60] text-[24px] text-center text-nowrap tracking-[0.33px]">Rockxchagr</p>
            <p className="font-['Lato:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[15px] text-[rgba(0,0,0,0.5)] text-center text-nowrap tracking-[-0.2px]">7865984</p>
          </div>
          <div className="content-stretch flex gap-[32px] h-[58px] items-start relative shrink-0 w-[256px]" data-name="Actions">
            <div className="h-[58px] overflow-clip relative shrink-0 w-[40px]" data-name="Action 4">
              <IconBackgroundImage additionalClassNames="left-0 size-[40px] top-0">
                <path clipRule="evenodd" d={svgPaths.p1fd92980} fill="var(--fill-0, black)" fillOpacity="0.04" fillRule="evenodd" id="Oval" />
                <path d={svgPaths.paca1870} fill="var(--fill-0, #565F60)" id="Vector" />
              </IconBackgroundImage>
              <p className="absolute font-['Lato:Regular',sans-serif] leading-[normal] left-[11.25%] not-italic right-[13.75%] text-[12px] text-[rgba(0,0,0,0.5)] text-center text-nowrap top-[calc(50%+15px)] tracking-[-0.01px]">Block</p>
            </div>
            <div className="h-[58px] overflow-clip relative shrink-0 w-[40px]" data-name="Action 4">
              <IconBackgroundImage additionalClassNames="inset-[0_0_31.03%_0]">
                <path clipRule="evenodd" d={svgPaths.p1fd92980} fill="var(--fill-0, black)" fillOpacity="0.04" fillRule="evenodd" id="Oval" />
                <path d={svgPaths.p211f4c00} fill="var(--fill-0, #565F60)" id="Vector" />
              </IconBackgroundImage>
              <p className="absolute font-['Lato:Regular',sans-serif] leading-[normal] left-[13.75%] not-italic right-[13.75%] text-[12px] text-[rgba(0,0,0,0.5)] text-center text-nowrap top-[calc(50%+15px)] tracking-[-0.01px]">Mute</p>
            </div>
            <div className="h-[58px] overflow-clip relative shrink-0 w-[40px]" data-name="Action 4">
              <BackgroundImage additionalClassNames="absolute inset-[0_0_31.03%_0]">
                <g id="Icon">
                  <path clipRule="evenodd" d={svgPaths.p1fd92980} fill="var(--fill-0, black)" fillOpacity="0.04" fillRule="evenodd" id="Oval" />
                  <g clipPath="url(#clip0_3_348)" id="Review">
                    <path d={svgPaths.p2d682380} fill="var(--fill-0, #565F60)" id="Vector" />
                    <path d={svgPaths.p2497ad00} fill="var(--fill-0, #565F60)" id="Vector_2" />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_3_348">
                    <rect fill="white" height="18" transform="translate(11.5 11)" width="18" />
                  </clipPath>
                </defs>
              </BackgroundImage>
              <p className="absolute font-['Lato:Regular',sans-serif] leading-[normal] left-[1.25%] not-italic right-[1.25%] text-[12px] text-[rgba(0,0,0,0.5)] text-center text-nowrap top-[calc(50%+15px)] tracking-[-0.01px]">Review</p>
            </div>
            <div className="h-[58px] overflow-clip relative shrink-0 w-[40px]" data-name="Action 4">
              <p className="absolute font-['Lato:Regular',sans-serif] leading-[normal] left-[16.25%] not-italic right-[11.25%] text-[12px] text-[rgba(0,0,0,0.5)] text-center text-nowrap top-[calc(50%+15px)] tracking-[-0.01px]">More</p>
              <div className="absolute content-stretch flex gap-[10px] items-start justify-center left-[0.5px] top-0">
                <BackgroundImage additionalClassNames="relative shrink-0 size-[40px]">
                  <path clipRule="evenodd" d={svgPaths.p1fd92980} fill="var(--fill-0, black)" fillOpacity="0.04" fillRule="evenodd" id="Oval" />
                </BackgroundImage>
                <div className="absolute contents inset-[47.5%_31.25%_45%_35%]" data-name="Layer 2">
                  <div className="absolute inset-[47.5%_31.25%_45%_35%]" data-name="more-horizotnal">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 3">
                      <g id="more-horizotnal">
                        <path d={svgPaths.p18fd2b00} fill="var(--fill-0, #565F60)" id="Vector" />
                        <path d={svgPaths.pfe26c00} fill="var(--fill-0, #565F60)" id="Vector_2" />
                        <path d={svgPaths.p3cbff000} fill="var(--fill-0, #565F60)" id="Vector_3" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[24px] h-[397px] items-center relative shrink-0">
            <div className="h-px relative shrink-0 w-[343px]" data-name="Seperator">
              <div className="absolute bottom-1/4 left-[-0.07%] right-[-0.07%] top-1/4">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 344 1">
                  <path d="M0.25 0.25H343.25" id="Seperator" stroke="var(--stroke-0, black)" strokeLinecap="square" strokeOpacity="0.12" strokeWidth="0.5" />
                </svg>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
              <p className="font-['Lato:Bold',sans-serif] h-[18.135px] leading-[normal] not-italic relative shrink-0 text-[#565f60] text-[18px] w-[145px]">Scenario Mapping</p>
              <div className="content-stretch flex flex-col gap-[10px] h-[210px] items-start relative shrink-0 w-[340px]">
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
                  <div className="[grid-area:1_/_1] h-[210px] ml-0 mt-0 rounded-[16px] w-[340px]" style={{ backgroundImage: "linear-gradient(154.401deg, rgba(255, 206, 183, 0.6) 30.408%, rgba(186, 207, 255, 0.404) 56.754%, rgba(199, 207, 242, 0.44) 88.551%)" }} />
                </div>
                <div className="absolute content-stretch flex flex-col items-start left-[10px] top-[24.18px]">
                  <div className="content-stretch flex items-start justify-between relative shrink-0 w-[320px]">
                    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[80px]">
                      <div className="basis-0 grid-cols-[max-content] grid-rows-[max-content] grow inline-grid leading-[0] min-h-px min-w-px place-items-start relative shrink-0">
                        <div className="[grid-area:1_/_1] bg-[rgba(60,232,98,0.75)] h-[140px] ml-[28px] mt-0 opacity-80 rounded-[12px] w-[23.9px]" />
                        <p className="[grid-area:1_/_1] font-['Lato:SemiBold',sans-serif] leading-[normal] ml-[40px] mt-[148px] not-italic relative text-[12px] text-[rgba(43,46,45,0.74)] text-center translate-x-[-50%] w-[80px]">Work-Balance</p>
                        <div className="[grid-area:1_/_1] ml-[29px] mt-[8px] relative shadow-[0px_6px_6px_-4px_rgba(255,149,96,0.46)] size-[22px]" data-name="emoji">
                          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgEmoji} />
                        </div>
                      </div>
                    </div>
                    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                      <div className="[grid-area:1_/_1] bg-[#f6f4f9] h-[140px] ml-[27.97px] mt-0 rounded-[12px] w-[23.902px]" />
                      <p className="[grid-area:1_/_1] font-['Lato:SemiBold',sans-serif] leading-[normal] ml-[40px] mt-[148px] not-italic relative text-[12px] text-[rgba(43,46,45,0.74)] text-center translate-x-[-50%] w-[80px]">Self-Esteem</p>
                    </div>
                    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[80px]">
                      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                        <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
                          <p className="[grid-area:1_/_1] font-['Lato:SemiBold',sans-serif] leading-[normal] ml-[35.5px] mt-[148px] not-italic relative text-[12px] text-[rgba(43,46,45,0.74)] text-center text-nowrap translate-x-[-50%]">Relationships</p>
                          <div className="[grid-area:1_/_1] bg-[#f6f4f9] h-[140px] ml-[22.86px] mt-0 rounded-[12px] w-[23.902px]" />
                          <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-[36px] place-items-start relative">
                            <div className="[grid-area:1_/_1] bg-[rgba(54,134,255,0.75)] h-[104px] ml-0 mt-0 opacity-80 rounded-[12px] w-[23.902px]" />
                            <div className="[grid-area:1_/_1] h-[22px] ml-px mt-px relative shadow-[0px_6px_6px_-4px_rgba(255,149,96,0.46)] w-[21.91px]" data-name="emoji">
                              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgEmoji1} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[80px]">
                      <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                        <div className="[grid-area:1_/_1] bg-[#f6f4f9] h-[140px] ml-[13.98px] mt-0 rounded-[12px] w-[23.902px]" />
                        <p className="[grid-area:1_/_1] font-['Lato:SemiBold',sans-serif] leading-[normal] ml-[25.5px] mt-[148px] not-italic relative text-[12px] text-[rgba(43,46,45,0.74)] text-center text-nowrap translate-x-[-50%]">Gratitude</p>
                        <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-[75px] place-items-start relative">
                          <div className="[grid-area:1_/_1] bg-[rgba(255,92,0,0.75)] h-[65px] ml-0 mt-0 opacity-80 rounded-[12px] w-[23.902px]" />
                          <div className="[grid-area:1_/_1] h-[22px] ml-px mt-px relative shadow-[0px_6px_6px_-4px_rgba(253,129,97,0.4)] w-[21.91px]" data-name="emoji">
                            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgEmoji2} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bg-[rgba(255,31,17,0.75)] h-[30px] opacity-80 right-[188.1px] rounded-[12px] top-[110px] w-[23.902px]" />
                    <div className="absolute h-[22px] right-[189.09px] shadow-[0px_6px_6px_-4px_rgba(242,42,102,0.4)] top-[110px] w-[21.91px]" data-name="emoji">
                      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgEmoji3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[340px]">
              <BackgroundImageAndText text="Today’s check-in" additionalClassNames="w-full" />
              <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                <div className="[grid-area:1_/_1] h-[66px] ml-0 mt-0 rounded-[16px] w-[340px]" style={{ backgroundImage: "linear-gradient(172.245deg, rgba(186, 230, 255, 0.67) 44.795%, rgba(208, 207, 233, 0.34) 16.012%, rgb(255, 206, 183) 137.61%, rgb(223, 39, 113) 137.62%)" }} />
                <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Mask group">
                  <div className="[grid-area:1_/_1] flex h-[141.229px] items-center justify-center ml-[-62.96px] mt-[-14px] relative w-[219.863px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
                    <div className="flex-none rotate-[3.058deg] skew-x-[0.583deg]">
                      <div className="h-[129.906px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[62.963px_14px] mask-size-[340px_66px] relative w-[214.56px]" style={{ maskImage: `url('${imgGroup162954}')` }}>
                        <div className="absolute inset-[0_0_-0.12%_-0.1%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 215 131">
                            <g id="Group 162954">
                              <path d={svgPaths.paa60800} id="Vector 13" stroke="var(--stroke-0, white)" strokeOpacity="0.42" />
                              <path d={svgPaths.pb5ae00} id="Vector 14" stroke="var(--stroke-0, white)" strokeOpacity="0.42" />
                              <path d={svgPaths.p1ac82800} id="Vector 15" stroke="var(--stroke-0, white)" strokeOpacity="0.42" />
                              <path d={svgPaths.p12d65900} id="Vector 16" stroke="var(--stroke-0, white)" strokeOpacity="0.42" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="[grid-area:1_/_1] content-stretch flex flex-col items-start ml-[6px] mt-[6px] p-[10px] relative">
                  <div className="content-stretch flex gap-[16px] items-center leading-[0] relative shrink-0 w-[113px]">
                    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
                      <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[34px] size-[34px]" />
                      <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] ml-[5px] mt-[5px] place-items-start relative">
                        <div className="[grid-area:1_/_1] blur-sm filter ml-[4.08px] mt-[9.52px] relative size-[14.28px]" data-name="acfc24b007f742e181c004f11d4128f7">
                          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAcfc24B007F742E181C004F11D4128F7} />
                        </div>
                        <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
                          <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[21.76px]" data-name="acfc24b007f742e181c004f11d4128f7">
                            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgAcfc24B007F742E181C004F11D4128F7} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
                      <div className="[grid-area:1_/_1] flex flex-col font-['Lato:Medium',sans-serif] justify-center leading-[0] ml-0 mt-[10px] not-italic relative text-[#565f60] text-[16px] text-nowrap translate-y-[-50%]">
                        <p className="leading-[20px]">Check-in</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="[grid-area:1_/_1] flex flex-col font-['Pangram:Regular',sans-serif] justify-center ml-[297px] mt-[32px] not-italic relative text-[16px] text-black text-shadow-[0px_4px_4px_rgba(248,140,2,0.34)] translate-y-[-50%] w-[14.392px]">
                  <p className="leading-[normal]">🔥</p>
                </div>
                <div className="[grid-area:1_/_1] content-stretch flex gap-[10px] items-center ml-[248px] mt-[13px] relative w-[76px]">
                  <div className="flex flex-col font-['Lato:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#565f60] text-[16px] text-nowrap">
                    <p className="leading-[20px]">3/3</p>
                  </div>
                  <BackgroundImage additionalClassNames="relative shrink-0 size-[40px]">
                    <g id="Group 141">
                      <path d={svgPaths.p1cb24b00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Ellipse 66" />
                      <g filter="url(#filter0_i_3_322)" id="Ellipse 65">
                        <path d={svgPaths.p1cb24b00} fill="url(#paint0_radial_3_322)" />
                      </g>
                    </g>
                    <defs>
                      <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="42" id="filter0_i_3_322" width="40" x="0" y="0">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                        <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                        <feOffset dy="2" />
                        <feGaussianBlur stdDeviation="2" />
                        <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
                        <feBlend in2="shape" mode="normal" result="effect1_innerShadow_3_322" />
                      </filter>
                      <radialGradient cx="0" cy="0" gradientTransform="translate(21.7143 0.857143) rotate(107.057) scale(26.2997 12.4372)" gradientUnits="userSpaceOnUse" id="paint0_radial_3_322" r="1">
                        <stop stopColor="#FFC4DB" />
                        <stop offset="1" stopColor="#FF62A0" />
                      </radialGradient>
                    </defs>
                  </BackgroundImage>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
            <BackgroundImageAndText text="User Profile" additionalClassNames="w-[340px]" />
            <div className="bg-white content-stretch flex items-center justify-between px-[40px] py-[12px] relative rounded-[16px] shrink-0 w-[340px]">
              <div aria-hidden="true" className="absolute border border-[#e4d9f8] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_8px_0px_rgba(189,189,189,0.08)]" />
              <div className="content-stretch flex items-center opacity-80 relative shrink-0 w-[80px]">
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                  <div className="relative shrink-0 size-[32px]" data-name="tier">
                    <div className="absolute inset-[1.93%_6.7%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 31">
                        <path d={svgPaths.pba00f00} fill="var(--fill-0, #F6C54D)" id="Background" />
                      </svg>
                    </div>
                    <div className="absolute bottom-[4.17%] left-1/2 top-[4.17%] translate-x-[-50%] w-[29.333px]" data-name="Background">
                      <div className="absolute inset-[1.41%_6.7%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 29">
                          <path d={svgPaths.p3c228050} fill="url(#paint0_linear_3_318)" id="Background" />
                          <defs>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_3_318" x1="-1.96542" x2="27.368" y1="28.9206" y2="-0.412892">
                              <stop stopColor="#E8A312" />
                              <stop offset="1" stopColor="#FFDA72" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute left-1/2 overflow-clip size-[18.667px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="solar:medal-star-circle-bold-duotone">
                      <div className="absolute inset-[8.33%_16.67%]" data-name="Group">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 16">
                          <g id="Group">
                            <path d={svgPaths.p1fb28b00} fill="var(--fill-0, white)" id="Vector" opacity="0.5" />
                            <path clipRule="evenodd" d={svgPaths.p15f0a000} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start justify-center not-italic relative shrink-0 text-nowrap">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[#d69400] text-[16px] tracking-[-0.408px]">Gold</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#a0a4b0] text-[12px]">{`Badge `}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#475467] h-[41px] opacity-10 rounded-[16px] shrink-0 w-[2px]" />
              <div className="content-stretch flex items-center relative shrink-0 w-[80px]">
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                  <div className="relative shrink-0 size-[32px]" data-name="points">
                    <BackgroundImage additionalClassNames="absolute inset-[-9.38%_-12.5%_-15.63%_-12.5%]">
                      <g filter="url(#filter0_dd_3_326)" id="points">
                        <g clipPath="url(#clip0_3_326)">
                          <circle cx="20" cy="19" fill="var(--fill-0, #FFA831)" id="Ellipse 45" r="15.75" stroke="var(--stroke-0, #EE8F0F)" strokeWidth="0.5" />
                          <circle cx="20" cy="19" fill="url(#paint0_linear_3_326)" id="Ellipse 56" r="13.75" stroke="var(--stroke-0, #FDBD4D)" strokeWidth="0.5" />
                          <g filter="url(#filter1_dd_3_326)" id="Vector">
                            <path d={svgPaths.p1c94e600} fill="var(--fill-0, #FDE194)" />
                          </g>
                        </g>
                      </g>
                      <defs>
                        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="40" id="filter0_dd_3_326" width="40" x="0" y="0">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feOffset dy="1" />
                          <feGaussianBlur stdDeviation="2" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                          <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3_326" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feOffset />
                          <feGaussianBlur stdDeviation="0.5" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.039 0" />
                          <feBlend in2="effect1_dropShadow_3_326" mode="normal" result="effect2_dropShadow_3_326" />
                          <feBlend in="SourceGraphic" in2="effect2_dropShadow_3_326" mode="normal" result="shape" />
                        </filter>
                        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="19" id="filter1_dd_3_326" width="19" x="10.5" y="10">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feOffset dy="0.5" />
                          <feGaussianBlur stdDeviation="0.75" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
                          <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3_326" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feOffset />
                          <feGaussianBlur stdDeviation="0.5" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.039 0" />
                          <feBlend in2="effect1_dropShadow_3_326" mode="normal" result="effect2_dropShadow_3_326" />
                          <feBlend in="SourceGraphic" in2="effect2_dropShadow_3_326" mode="normal" result="shape" />
                        </filter>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_3_326" x1="31.375" x2="7.5" y1="26.875" y2="13">
                          <stop stopColor="#FEC258" />
                          <stop offset="0.493004" stopColor="#F8AA1E" />
                          <stop offset="0.978599" stopColor="#FEC258" />
                        </linearGradient>
                        <clipPath id="clip0_3_326">
                          <path d={svgPaths.p826c500} fill="white" />
                        </clipPath>
                      </defs>
                    </BackgroundImage>
                  </div>
                  <div className="content-stretch flex flex-col items-start justify-center not-italic relative shrink-0 text-nowrap">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[#d69400] text-[16px] tracking-[-0.408px]">1.200</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#a0a4b0] text-[12px]">Points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents inset-[0.77%_96.32%_96.38%_0]">
          <div className="absolute inset-[0.77%_96.32%_96.38%_0]" data-name="Back">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 23">
              <g id="Back">
                <path d={svgPaths.p52d2100} fill="var(--fill-0, #565F60)" id="Shape" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#565f60] bottom-[9px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] translate-x-[-50%] w-[134px]" data-name="Line" />
    </div>
  );
}