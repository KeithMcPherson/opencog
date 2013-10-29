/*
 *
 * Copyright (C) 2010 by Singularity Institute for Artificial Intelligence
 * Copyright (C) 2010 by Joel Pitt
 * All Rights Reserved
 *
 * Written by Joel Pitt <joel@fruitionnz.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License v3 as
 * published by the Free Software Foundation and including the exceptions
 * at http://opencog.org/wiki/Licenses
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program; if not, write to:
 * Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#include "GetConfigRequest.h"
#include "BaseURLHandler.h"

#include "GetAtomRequest.h"

#include <opencog/util/Config.h>
#include <opencog/server/CogServer.h>

#include <boost/algorithm/string.hpp>
#include <boost/bind.hpp>
#include <boost/lexical_cast.hpp>

using namespace opencog;


GetConfigRequest::GetConfigRequest()
{

}

GetConfigRequest::~GetConfigRequest()
{
    logger().debug("[GetConfigRequest] destructor");
}

bool GetConfigRequest::execute()
{
    //@todo fix this

    output_format = json_format;
    if (output_format == json_format) {
        json_makeOutput();
    } else {
        html_makeOutput();
    }
    send(_output.str()); // send output to RequestResult instance
    return true;
}

void GetConfigRequest::sendError(std::string err)
{
    //! @todo: different responses for different formats json/html
    _output << err << std::endl;
    send(_output.str());
}



void GetConfigRequest::html_makeOutput()
{
    //@todo actually make this work
    _output << config().to_string();

}

void GetConfigRequest::json_makeOutput()
{
    std::string conf = config().to_string();
    //control characters aren't allowed in json, must be escaped
    boost::replace_all(conf, "\n", "\\n");
    boost::replace_all(conf, "\t", "\\t");
    boost::replace_all(conf, "\r", "\\n");

    //@todo parse out color formatting instead of just esc
    std::stringstream ssESC;
    char ESC = ((char) 27);
    ssESC << ESC;
    boost::replace_all(conf, ssESC.str(), " ");

    //output from to_string is nearly identical to json
    boost::replace_all(conf, " =>", ":");

    _output << conf;

}
