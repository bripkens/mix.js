require 'rubygems'

desc "build the minified version for distribution"
task :build do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "closure-compiler not found.\nInstall it by running 'gem install closure-compiler"
    exit
  end
  source = File.read 'mix.js'
  File.open('mix-min.js', 'w+') do |file|
    file.write Closure::Compiler.new.compress(source)
  end
end