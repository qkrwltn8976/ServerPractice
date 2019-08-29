__author__ = 'onecue'

import scrapy

from community.items import CommunityItem

class CommunitySpider(scrapy.Spider):
    name = "communityCrawler"
    # start_url
    namespaces = [('atom', 'http://www.w3.org/2005/Atom')]
    itertag = 'atom:entry'
    iterator = 'xml'

    def start_requests(self):
        for i in range(1,2,1):
            yield scrapy.Request("https://www.bobaedream.co.kr/list?code=freeb&s_cate=&maker_no=&model_no=&or_gu=10&or_se=desc&s_selday=&pagescale=30&info3=&noticeShow=&s_select=&s_key=&level_no=&vdate=&type=list&page=%d" %i, self.parse_bobae)
        for i in range(1,2,1):
            yield scrapy.Request("https://pann.nate.com/talk/c20002?page=%d" %i, self.parse_pann)


    def parse_bobae(self, response):
        for sel in response.xpath('//tbody/tr[@itemtype="http://schema.org/Article"]'): 
            item = CommunityItem()
            item['source'] = "bobae"
            item['category'] = "free"
            item['title'] = sel.xpath('td[@class="pl14"]/a/text()').extract()[0]
            item['url'] = 'http://www.bobaedrea.co.kr' + sel.xpath('td[@class="pl14"]/a/@href').extract()[0]
            # dateTmp = datetime.strptime(sel.xpath('div[@class="list_time"]/span/span[@class="timestamp"]').extract()[0], "%Y-%m-%d %H:%M:%S")
            # item['date'] = dateTmp.strftime("%Y-%m-%d %H:%M:%S")

            print '='*50
            print item['title']

            yield item

    def parse_pann(self, response):
        for sel in response.xpath('///tbody/tr'):
            item = CommunityItem()
            item['source'] = "pann"
            item['category'] = "20s"
            item['title'] = sel.xpath('td/a/text()').extract()[0]
            
            print '-'*50
            print item['title']

            yield item