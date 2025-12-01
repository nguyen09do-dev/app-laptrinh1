'use client';

import Link from 'next/link';
import { Sparkles, Lightbulb, FileText, BookOpen, BarChart3, ArrowRight, Zap, TrendingUp, Clock, Users, CheckCircle2, Star } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen text-white overflow-hidden">

      {/* Top Bar */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Content Studio
          </span>
        </div>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg font-medium transition-all"
        >
          Đăng nhập
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight animate-fade-in-up">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AI Content Studio
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            Nền tảng tạo nội dung thông minh dành cho người sáng tạo
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Biến ý tưởng thành nội dung chất lượng cao chỉ trong vài phút với sức mạnh của AI.
            Từ ý tưởng, brief, đến bài viết hoàn chỉnh - tất cả tự động.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
            <Link
              href="/dashboard"
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">Bắt đầu miễn phí</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="#features"
              className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              Xem demo
              <Zap className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up delay-400">
            {[
              { icon: Zap, label: 'AI-Powered', desc: 'Công nghệ tiên tiến' },
              { icon: Clock, label: '< 5 phút', desc: 'Tạo nội dung' },
              { icon: TrendingUp, label: '10x Nhanh hơn', desc: 'So với thủ công' },
              { icon: Users, label: '1000+', desc: 'Người dùng' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quy trình 3 bước đơn giản
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Từ ý tưởng đến nội dung hoàn chỉnh, chỉ trong vài cú click
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:border-blue-500/50 transition-all hover:scale-105 hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg shadow-blue-500/50">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">01</div>
                <h3 className="text-2xl font-bold text-white mb-4">Ý Tưởng Sáng Tạo</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  AI phân tích xu hướng và tạo ra những ý tưởng nội dung độc đáo, phù hợp với đối tượng mục tiêu của bạn.
                </p>
                <ul className="space-y-2">
                  {['Phân tích xu hướng', 'Tùy chỉnh ngành nghề', 'Đa dạng persona'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:border-purple-500/50 transition-all hover:scale-105 hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 shadow-lg shadow-purple-500/50">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-purple-400 mb-2">02</div>
                <h3 className="text-2xl font-bold text-white mb-4">Brief Chi Tiết</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Chuyển ý tưởng thành brief chuyên nghiệp với mục tiêu rõ ràng và cấu trúc hoàn chỉnh.
                </p>
                <ul className="space-y-2">
                  {['Mục tiêu cụ thể', 'Cấu trúc chi tiết', 'Tone & Style'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:border-pink-500/50 transition-all hover:scale-105 hover:-translate-y-2">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 mb-6 shadow-lg shadow-pink-500/50">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-pink-400 mb-2">03</div>
                <h3 className="text-2xl font-bold text-white mb-4">Nội Dung Hoàn Chỉnh</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  AI tạo bài viết chuyên nghiệp, có cấu trúc rõ ràng và ngôn ngữ tự nhiên, sẵn sàng publish.
                </p>
                <ul className="space-y-2">
                  {['Cấu trúc chuẩn', 'Ngôn ngữ tự nhiên', 'Sẵn sàng sử dụng'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-pink-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-12 md:p-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mx-auto mb-8 shadow-2xl shadow-blue-500/50">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Theo dõi hiệu suất nội dung
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Dashboard analytics mạnh mẽ giúp bạn theo dõi mọi hoạt động,
                phân tích xu hướng và tối ưu hóa chiến lược nội dung.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                {['Real-time tracking', 'Insights chi tiết', 'Export reports'].map((feature, i) => (
                  <div key={i} className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold">
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl font-bold text-lg shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
              >
                Xem Analytics Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">
              Miễn phí dùng thử - Không cần thẻ tín dụng
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Sẵn sàng tạo nội dung?
          </h2>
          <p className="text-2xl text-gray-300 mb-12">
            Tham gia cùng hàng ngàn người sáng tạo đang sử dụng AI Content Studio
          </p>

          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 rounded-2xl font-extrabold text-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-110 transition-all overflow-hidden"
          >
            <span className="relative z-10">Bắt đầu ngay - Miễn phí</span>
            <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <p className="text-sm text-gray-400 mt-8">
            Không yêu cầu thông tin thanh toán • Bắt đầu trong 30 giây • Hỗ trợ tiếng Việt 100%
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">AI Content Studio</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 AI Content Studio. Powered by Advanced AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
