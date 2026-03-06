# Shim to restore deprecated File.exists? method removed in newer Rubies
unless File.respond_to?(:exists?)
  class << File
    alias_method :exists?, :exist?
  end
end
