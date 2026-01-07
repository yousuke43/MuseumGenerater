'use client';

import React, { forwardRef } from 'react';
import { LabelData } from '@/types/label';

interface MuseumLabelProps {
  data: LabelData;
}

// L字型のコーナー装飾コンポーネント
const CornerDecoration = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const baseClasses = "absolute w-3 h-3 pointer-events-none";
  const lineColor = "border-stone-400/50";
  
  const positionClasses = {
    'top-left': 'top-2 left-2 border-t border-l',
    'top-right': 'top-2 right-2 border-t border-r',
    'bottom-left': 'bottom-2 left-2 border-b border-l',
    'bottom-right': 'bottom-2 right-2 border-b border-r',
  };

  return <div className={`${baseClasses} ${positionClasses[position]} ${lineColor}`} />;
};

const MuseumLabel = forwardRef<HTMLDivElement, MuseumLabelProps>(({ data }, ref) => {
  const hasContent = data.title || data.description || data.author || data.year || data.image;
  const hasInfo = data.title || data.author || data.year;

  return (
    <div 
      ref={ref}
      className="relative min-h-[500px] p-8 md:p-16 flex flex-col items-center justify-center gap-10"
      style={{ backgroundColor: '#f8f7f5' }}
    >
      {/* 美術館の壁のテクスチャ風の背景 */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
           }} 
      />

      {hasContent ? (
        <>
          {/* 額縁エリア（壁に掛かった絵画） */}
          {data.image && (
            <div className="relative flex justify-center">
              {/* 額縁全体のコンテナ */}
              <div 
                className="relative"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3)) drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
                }}
              >
                {/* 額縁の外枠 - 木目調 */}
                <div 
                  className="relative p-5 md:p-6"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        #8B6914 0%, 
                        #A67C00 5%, 
                        #8B6914 10%, 
                        #6B4423 20%,
                        #5D3A1A 30%,
                        #4A2C0F 50%,
                        #5D3A1A 70%,
                        #6B4423 80%,
                        #8B6914 90%,
                        #A67C00 95%,
                        #8B6914 100%
                      )
                    `,
                  }}
                >
                  {/* 木目テクスチャのオーバーレイ */}
                  <div 
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          90deg,
                          transparent 0px,
                          rgba(0,0,0,0.03) 1px,
                          transparent 2px,
                          transparent 4px
                        ),
                        repeating-linear-gradient(
                          87deg,
                          transparent 0px,
                          rgba(139,105,20,0.1) 2px,
                          transparent 4px,
                          transparent 8px
                        ),
                        repeating-linear-gradient(
                          93deg,
                          transparent 0px,
                          rgba(74,44,15,0.08) 1px,
                          transparent 3px,
                          transparent 12px
                        )
                      `,
                    }}
                  />
                  
                  {/* 額縁の内側の段（面取り部分） - 上 */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-5 md:h-6"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,220,150,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                    }}
                  />
                  {/* 額縁の内側の段 - 下 */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-5 md:h-6"
                    style={{
                      background: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(255,220,150,0.1) 100%)',
                    }}
                  />
                  {/* 額縁の内側の段 - 左 */}
                  <div 
                    className="absolute top-0 bottom-0 left-0 w-5 md:w-6"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,220,150,0.3) 0%, rgba(0,0,0,0.15) 100%)',
                    }}
                  />
                  {/* 額縁の内側の段 - 右 */}
                  <div 
                    className="absolute top-0 bottom-0 right-0 w-5 md:w-6"
                    style={{
                      background: 'linear-gradient(270deg, rgba(0,0,0,0.25) 0%, rgba(255,220,150,0.1) 100%)',
                    }}
                  />

                  {/* 金色のインナーライン */}
                  <div 
                    className="relative p-1"
                    style={{
                      background: 'linear-gradient(145deg, #D4AF37 0%, #FFD700 25%, #D4AF37 50%, #B8860B 75%, #D4AF37 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* インナーの木目ライン */}
                    <div 
                      className="relative p-1"
                      style={{
                        background: 'linear-gradient(145deg, #5D3A1A 0%, #4A2C0F 50%, #3D2409 100%)',
                      }}
                    >
                      {/* マット（余白）- ベルベット風 */}
                      <div 
                        className="relative p-4 md:p-6"
                        style={{
                          background: 'linear-gradient(145deg, #f5f5f0 0%, #e8e6e0 100%)',
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {/* 画像本体 */}
                        <img
                          src={data.image}
                          alt={data.title || '作品画像'}
                          className="w-full h-auto object-contain max-h-72 md:max-h-96 block relative z-10"
                          style={{
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 額縁のコーナー装飾（45度カット風） */}
                <div className="absolute top-0 left-0 w-8 h-8 overflow-hidden pointer-events-none">
                  <div 
                    className="absolute w-12 h-12 -rotate-45 origin-bottom-right"
                    style={{ 
                      background: 'linear-gradient(90deg, rgba(255,220,150,0.2) 0%, transparent 100%)',
                      top: '-6px',
                      left: '-6px',
                    }}
                  />
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                  <div 
                    className="absolute w-12 h-12 rotate-45 origin-bottom-left"
                    style={{ 
                      background: 'linear-gradient(270deg, rgba(0,0,0,0.15) 0%, transparent 100%)',
                      top: '-6px',
                      right: '-6px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 説明プレート（コンパクトなミュージアムプレート） */}
          <div className="relative">
            {/* プレート本体 - 小さめのアクリル/樹脂プレート */}
            <div 
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 50%, #f5f5f3 100%)',
                boxShadow: `
                  0 1px 0 0 rgba(255,255,255,0.9) inset,
                  0 -1px 0 0 rgba(0,0,0,0.03) inset,
                  0 2px 8px -2px rgba(0,0,0,0.08),
                  0 1px 3px -1px rgba(0,0,0,0.05)
                `,
              }}
            >
              {/* プレート上部のハイライト（光沢感） */}
              <div 
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)' }}
              />

              {/* コーナー装飾 */}
              <CornerDecoration position="top-left" />
              <CornerDecoration position="top-right" />
              <CornerDecoration position="bottom-left" />
              <CornerDecoration position="bottom-right" />

              {/* コンテンツエリア */}
              <div className="relative z-10 flex flex-col md:flex-row">
                {/* 左側：作品情報 */}
                {hasInfo && (
                  <div className="px-5 py-4 md:px-6 md:py-5 md:border-r border-stone-200/60 flex items-center">
                    <div className="space-y-1 text-center w-full">
                      {/* 作品名 */}
                      <h1 className="font-serif text-base md:text-lg font-semibold text-stone-1000 
                                    tracking-wide leading-tight">
                        {data.title || '無題'}
                      </h1>

                      {/* 作者 */}
                      {data.author && (
                        <p className="text-stone-600 text-xs md:text-sm">
                          {data.author}
                        </p>
                      )}

                      {/* 制作年 */}
                      {data.year && (
                        <p className="text-stone-400 text-xs">
                          {data.year}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 中央の区切り線（モバイル用） */}
                {hasInfo && data.description && (
                  <div className="md:hidden mx-5 border-t border-stone-200/60" />
                )}

                {/* 右側：説明文 */}
                {data.description && (
                  <div className="px-5 py-4 md:px-6 md:py-5 max-w-xs">
                    <p className="text-stone-500 text-xs md:text-sm leading-relaxed 
                                whitespace-pre-wrap">
                      {data.description}
                    </p>
                  </div>
                )}
              </div>

              {/* プレート下部のシャドウ（厚み感） */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)' }}
              />
            </div>

            {/* プレート台座（アクリルスタンド風） */}
            <div className="flex justify-center mt-1">
              <div 
                className="w-16 h-1 rounded-b-sm"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
                  boxShadow: '0 1px 2px -1px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          </div>
        </>
      ) : (
        /* 空の状態 */
        <div 
          className="relative overflow-hidden p-8 md:p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 50%, #f5f5f3 100%)',
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.9) inset,
              0 -1px 0 0 rgba(0,0,0,0.03) inset,
              0 2px 8px -2px rgba(0,0,0,0.08),
              0 1px 3px -1px rgba(0,0,0,0.05)
            `,
          }}
        >
          <CornerDecoration position="top-left" />
          <CornerDecoration position="top-right" />
          <CornerDecoration position="bottom-left" />
          <CornerDecoration position="bottom-right" />
          
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100/80 
                          flex items-center justify-center">
              <svg
                className="w-6 h-6 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-stone-400 text-sm font-medium">作品情報を入力してください</p>
          </div>
        </div>
      )}
    </div>
  );
});

MuseumLabel.displayName = 'MuseumLabel';

export default MuseumLabel;
